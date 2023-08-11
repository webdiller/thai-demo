import faker from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
faker.locale = "ru";

const generateOrders = async (countOrders: number = 50) => {
  try {
    const EXIST_CITIES = await prisma.city.findMany();
    const EXIST_ORDER_CATEGORIES = await prisma.orderCategory.findMany({
      include: {
        subcategories: true,
      },
    });
    const EXIST_CUSTOMERS = await prisma.sellerProfile.findMany();

    for await (const _orderItem of Array.from({ length: countOrders })) {
      const selectedRandomCategory = EXIST_ORDER_CATEGORIES[Math.floor(Math.random() * EXIST_ORDER_CATEGORIES.length)];
      const selectedRandomSubCategory = selectedRandomCategory.subcategories[Math.floor(Math.random() * selectedRandomCategory.subcategories.length)];

      try {
        await prisma.order.create({
          data: {
            content: faker.lorem.words(50),
            price: parseInt(faker.commerce.price(1000, 10000)),
            title: faker.lorem.words(30),
            status: "START",
            isArhivated: Boolean(Date.now() % 2),
            category: {
              connect: {
                id: selectedRandomCategory.id,
              },
            },
            contact: {
              create: {
                phone: faker.phone.phoneNumber(),
                whatsapp: faker.phone.phoneNumber(),
                email: faker.internet.email(),
              },
            },
            subcategory: {
              connect: {
                id: selectedRandomSubCategory.id,
              },
            },
            sellerProfile: {
              connect: {
                id: EXIST_CUSTOMERS[
                  Math.floor(Math.random() * EXIST_CUSTOMERS.length)
                ].id,
              },
            },
            city: {
              connect: {
                id: EXIST_CITIES[
                  Math.floor(Math.random() * EXIST_CITIES.length)
                ].id,
              },
            },
          },
        });
      } catch (error) {}
    }
  } catch (error) {
    console.log(error);
  }
};

export { generateOrders };
