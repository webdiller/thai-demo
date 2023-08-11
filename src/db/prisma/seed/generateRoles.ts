import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const generateRoles = async () => {
  try {
    await prisma.userRole.createMany({
      skipDuplicates: true,
      data: [
        {
          name: "USER",
        },
        {
          name: "MANAGER",
        },
        {
          name: "ADMIN",
        },
      ],
    });
  } catch (error) {
    console.log(error);
  }
};

export { generateRoles };
