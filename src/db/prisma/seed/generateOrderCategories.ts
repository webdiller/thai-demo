import faker from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";
import { slugifyOptions } from "../../../libs/slugify";
import { CATEGORIES } from "../../../shared/consts";
const prisma = new PrismaClient();
faker.locale = "ru";

type TOrderCategory = {
  name: string;
  subcategories: string[];
};
const ALL_CATEGORIES: TOrderCategory[] = CATEGORIES;

const generateOrderCategories = async () => {
  try {
    for await (const category of ALL_CATEGORIES) {
      try {
        await prisma.orderCategory.upsert({
          where: {
            slug: slugify(category.name, slugifyOptions),
          },
          update: {
            name: category.name,
            slug: slugify(category.name, slugifyOptions),
            subcategories: {
              createMany: {
                skipDuplicates: true,
                data: category.subcategories.map((subcategoryName) => ({
                  name: subcategoryName,
                  slug: slugify(subcategoryName, slugifyOptions),
                })),
              },
            },
          },
          create: {
            name: category.name,
            slug: slugify(category.name, slugifyOptions),
            subcategories: {
              createMany: {
                skipDuplicates: true,
                data: category.subcategories.map((subcategoryName) => ({
                  name: subcategoryName,
                  slug: slugify(subcategoryName, slugifyOptions),
                })),
              },
            },
          },
        });
      } catch (error) {
        // @ts-ignore
        console.log(error?.message);
      }
    }
  } catch (error) {
    // @ts-ignore
    console.log(error?.message);
  }
};

export { generateOrderCategories };
