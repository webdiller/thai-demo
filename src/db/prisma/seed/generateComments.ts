import faker from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
faker.locale = "ru";

const generateComments = async (count = 10) => {
  try {
    const EXIST_PROFILES = await prisma.profile.findMany();
    const EXIST_ORDERS = await prisma.order.findMany();

    for await (const order of EXIST_ORDERS) {

      const AUTHOR = await prisma.order.findUnique({where: {id: order.id},select: {
        sellerProfile: {
            select: {
                profile: {
                    select: {
                        user: {
                            select: {
                                profile: {
                                    select: {
                                        id: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
      }})

      const filteredUsers = EXIST_PROFILES.filter(profile=>profile.id !== AUTHOR?.sellerProfile?.profile.user.profile?.id);
      const AUTHOR_2 = filteredUsers[Math.floor(Math.random() * filteredUsers.length)].id
      
      const filteredUsers2 = EXIST_PROFILES.filter(profile=>(profile.id !== AUTHOR?.sellerProfile?.profile.user.profile?.id && profile.id !== AUTHOR_2));
      const AUTHOR_3 = filteredUsers2[Math.floor(Math.random() * filteredUsers2.length)].id
      
      const filteredUsers3 = EXIST_PROFILES.filter(profile=>(profile.id !== AUTHOR?.sellerProfile?.profile.user.profile?.id && profile.id !== AUTHOR_2 && profile.id !== AUTHOR_3));
      const AUTHOR_4 = filteredUsers3[Math.floor(Math.random() * filteredUsers3.length)].id
      
      // 1 Comment
      const orderComment1 = await prisma.comment.create({
        data: {
          text: `Welcome to my order ${order.number}`,
          author: {
            connect: {
                id: AUTHOR?.sellerProfile?.profile.user.profile?.id
            }
          },
          order: {
            connect: {
                id: order.id
            }
          }
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export { generateComments };
