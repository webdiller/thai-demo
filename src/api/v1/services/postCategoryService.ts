import { Prisma } from "@prisma/client";
import prisma from "../libs/prisma";

class PostCategoryService {
  async getAll() {
    const postCategories = await prisma.postCategory.findMany({
      orderBy: {
        posts: {
          _count: "desc",
        },
      },
      where: {
        posts: {
          some: {
            stage: "PUBLISHED",
          },
        },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });
    return postCategories;
  }

  async getPaths() {
    const postCategories = await prisma.postCategory.findMany({
      where: {
        posts: {
          some: {
            stage: "PUBLISHED",
          },
        },
      },
      select: {
        slug: true,
      },
    });
    return postCategories;
  }

  async getOneBySlug(slug: string) {
    try {
      let inputValidationSelect = Prisma.validator<Prisma.PostCategorySelect>()(
        {
          id: true,
          slug: true,
          title: true,
          posts: {
            select: {
              id: true,
              slug: true,
              title: true,
              excerpt: true,
              countOfViews: true,
              createdAt: true,
              updatedAt: true,
              rootImage: {
                select: {
                  images: {
                    select: {
                      rootImageId: true,
                      groupId: true,
                      yandexLocation: true,
                      type: true,
                      format: true,
                      rootImage: {
                        select: {
                          serialNumber: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }
      );
      const postCategory = await prisma.postCategory.findFirst({
        where: {
          slug,
        },
        select: inputValidationSelect,
      });
      return postCategory;
    } catch (error) {
      return null;
    }
  }
}

export default new PostCategoryService();
