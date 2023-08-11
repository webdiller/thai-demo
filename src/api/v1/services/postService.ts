import { PostStage, Prisma } from "@prisma/client";
import prisma from "../libs/prisma";
import { CreatePostProps } from "src/types/post/createPost";
class PostService {
  async getAll(count = 10, minify = false) {
    const posts = await prisma.post.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      take: count,
      where: {
        stage: "PUBLISHED",
      },
      select: {
        id: true,
        slug: true,
        title: true,
        content: minify ? false : true,
        excerpt: minify ? false : true,
        countOfViews: true,
        stage: true,
        postCategory: {
          select: {
            title: true,
            slug: true,
          },
        },
        createdAt: minify ? false : true,
        updatedAt: minify ? false : true,
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
    });
    return posts;
  }
  async getPaths() {
    const posts = await prisma.post.findMany({
      where: {
        stage: "PUBLISHED",
      },
      select: {
        postCategory: {
          select: {
            slug: true,
          },
        },
        slug: true,
      },
    });
    return posts;
  }
  async getOneBySlug(slug: string) {
    const posts = await prisma.post.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        excerpt: true,
        countOfViews: true,
        postCategory: {
          select: {
            title: true,
            slug: true,
          },
        },
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
    });
    return posts;
  }
  async getOneByCategorySlugAndSlug(categorySlug: string, postSlug: string) {
    const posts = await prisma.post.findFirst({
      where: {
        AND: {
          postCategory: {
            slug: {
              equals: categorySlug,
            },
          },
          slug: postSlug,
        },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        excerpt: true,
        countOfViews: true,
        postCategory: {
          select: {
            title: true,
            slug: true,
          },
        },
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
    });
    return posts;
  }
  async updateCount(postSlug: string) {
    try {
      const post = await prisma.post.update({
        where: { slug: postSlug },
        data: {
          countOfViews: {
            increment: 1,
          },
        },
        select: {
          countOfViews: true,
        },
      });
      return post;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async deleteOne(postSlug: string) {
    try {
      const post = await prisma.post.delete({
        where: { slug: postSlug },
        select: {
          id: true,
        },
      });
      return post;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async updateStage(postSlug: string, stage: PostStage) {
    try {
      const post = await prisma.post.update({
        where: { slug: postSlug },
        data: {
          stage: stage,
        },
        select: {
          id: true,
        },
      });
      return post;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async createPost({
    title,
    slug,
    content,
    excerpt,
    postCategoryId,
    profileId,
  }: CreatePostProps) {
    try {
      const createInput = Prisma.validator<Prisma.PostCreateArgs>()({
        data: {
          title,
          slug,
          content,
          excerpt,
          postCategoryId,
          profileId,
        },
      });
      const post = await prisma.post.create(createInput);
      return post;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

export default new PostService();
