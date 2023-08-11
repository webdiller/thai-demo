import { PrismaClient } from "@prisma/client";
import { POST_CATEGORIES } from "../../../shared/consts";
import slugify from "slugify";
import { slugifyOptions } from "../../../libs/slugify";

const prisma = new PrismaClient();

const generateCategoriesForPosts = async () => {
  try {
    await prisma.postCategory.createMany({
      skipDuplicates: true,
      data: POST_CATEGORIES.map((category) => ({
        title: category.title,
        slug: slugify(category.title, slugifyOptions),
      })),
    });
  } catch (error) {
    console.log(error);
  }
};

export { generateCategoriesForPosts };
