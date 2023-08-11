import { PrismaClient } from "@prisma/client";
import slugify from "slugify";
import { slugifyOptions } from "../../../libs/slugify";
import faker from "@faker-js/faker";
faker.locale = "ru";

const prisma = new PrismaClient();

const generatePosts = async (countOfPosts: number = 30) => {
  try {
    const ALL_AVAILABLE_CATEGORIES = await prisma.postCategory.findMany({});
    const ALL_AVAILABLE_PROFILES = await prisma.profile.findMany({});

    for await (const _postItem of Array.from({ length: countOfPosts })) {
      const selectedRandomPostCategory = ALL_AVAILABLE_CATEGORIES[Math.floor(Math.random() * ALL_AVAILABLE_CATEGORIES.length)];
      const selectedRandomProfile = ALL_AVAILABLE_PROFILES[Math.floor(Math.random() * ALL_AVAILABLE_PROFILES.length)];
      
      try {
        await prisma.post.create({
          data: {
            title: faker.lorem.words(30),
            slug: slugify(faker.lorem.words(30), slugifyOptions),
            content: slugify(faker.lorem.words(100), slugifyOptions),
            excerpt: faker.lorem.words(20),
            postCategoryId: selectedRandomPostCategory.id,
            stage: "PUBLISHED",
            profileId: selectedRandomProfile.id
          },
        });
      } catch (error) {}
    }
  } catch (error) {
    console.log(error);
  }
};

export { generatePosts };
