import prisma from "../libs/prisma";
class OrderCategoryService {
  async getAll() {
    const users = await prisma.orderCategory.findMany({
      include: {
        subcategories: {
          select: {
            id: true,
            name: true,
            slug: true,
            _count: {
              select: {
                order: true
              }
            }
          },
        },
        _count: {
          select: {
            order: true
          }
        },
      },
    });
    return users;
  }
  async getOneBySlug(categorySlug: string) {
    const users = await prisma.orderCategory.findUnique({
      where: {
        slug: categorySlug,
      },
      include: {
        subcategories: {
          select: {
            id: true,
            name: true,
            slug: true,
            _count: {
              select: {
                order: true
              }
            }
          },
        },
        _count: {
          select: {
            order: true
          }
        }
      },
    });
    return users;
  }
}

export default new OrderCategoryService();
