import bcrypt from "bcrypt";
import faker from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { yandexS3Response } from "../../../helpers/yandexS3Response";
const prisma = new PrismaClient();
faker.locale = "ru";
const generateProfiles = async (countUsers: number = 10) => {
  try {
    const USER_ROLE = await prisma.userRole.findMany({
      where: {
        AND: {
          name: {
            in: ["USER", "MANAGER"],
          },
        },
      },
    });
    for await (let _ of Array.from({ length: countUsers })) {
      const email = faker.unique(faker.internet.email);
      const hashPassword = await bcrypt.hash(email, 3);
      const activationLink = uuidv4();

      await prisma.user.create({
        data: {
          email: email,
          password: hashPassword,
          activationLink: activationLink,
          roles: {
            connect: [
              {
                id: USER_ROLE[0].id,
              },
              {
                id: USER_ROLE[1].id,
              },
            ],
          },
          profile: {
            create: {
              contact: {
                create: {
                  phone: faker.phone.phoneNumber(),
                  whatsapp: faker.phone.phoneNumber(),
                  email: faker.internet.email(),
                  telegram: faker.name.firstName(),
                },
              },
              sellerProfile: {
                create: {
                  content: faker.lorem.words(30),
                  avatar: yandexS3Response(
                    faker.internet.avatar(),
                    faker.internet.avatar()
                  ),
                },
              },
              clientProfile: {
                create: {
                  content: faker.lorem.words(30),
                  avatar: yandexS3Response(
                    faker.internet.avatar(),
                    faker.internet.avatar()
                  ),
                },
              },
            },
          },
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export { generateProfiles };
