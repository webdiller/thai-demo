import { UpdateProfileRequest } from "../../../types/profile";
import prisma from "../libs/prisma";

class UserService {
  async getAll() {
    const users = await prisma.user.findMany({
      include: {
        profile: {
          include: {
            sellerProfile: {
              include: {
                orders: true,
              },
            },
            clientProfile: {},
          },
        },
      },
    });
    return users;
  }

  async getByUserId(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        email: true,
        profile: {
          select: {
            id: true,
            contact: true,
            sellerProfile: {
              select: {
                id: true,
                avatar: true,
                content: true,
                orders: {
                  orderBy: {
                    createdAt: "desc",
                  },
                  include: {
                    category: {
                      select: {
                        id: true,
                        name: true,
                        slug: true,
                      },
                    },
                    subcategory: {
                      include: {
                        orderCategory: {
                          select: {
                            id: true,
                            name: true,
                            slug: true,
                          },
                        },
                      },
                    },
                    city: {
                      select: {
                        id: true,
                        name: true,
                        slug: true,
                      },
                    },
                  },
                },
              },
            },
            clientProfile: {
              select: {
                id: true,
                avatar: true,
                content: true,
              },
            },
          },
        },
      },
    });
    return user;
  }

  // TODO: Too large data if include orders
  async getMe(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        roles: true,
        isActivated: true,
        profile: {
          select: {
            id: true,
            userId: true,
            contact: true,
            sellerProfile: {
              select: {
                id: true,
                avatar: true,
                content: true,
                orders: {
                  orderBy: {
                    createdAt: "desc",
                  },
                },
              },
            },
            clientProfile: {
              select: {
                id: true,
                avatar: true,
                content: true,
              },
            },
          },
        },
      },
    });
    return user;
  }

  async updateProfile({ id, contact }: UpdateProfileRequest) {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        profile: {
          update: {
            contact: {
              update: {
                phone: contact.phone,
                telegram: contact.telegram,
                whatsapp: contact.whatsapp,
                email: contact.email,
              },
            },
          },
        },
      },
      select: {
        id: true,
      },
    });
    return user;
  }

  async updateClient(id: string, content: string) {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        profile: {
          connect: {
            userId: id,
          },
          update: {
            clientProfile: {
              update: {
                content,
              },
            },
          },
        },
      },
    });
    return user;
  }
}

export default new UserService();
