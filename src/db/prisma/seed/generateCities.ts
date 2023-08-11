import faker from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import { THAI_CITIES } from "../../../shared/consts";
import slugify from "slugify";
import { slugifyOptions } from "../../../libs/slugify";
const prisma = new PrismaClient();
faker.locale = "ru";

const generateCities = async () => {
  try {
    await prisma.city.createMany({
      skipDuplicates: true,
      data: THAI_CITIES.map(city=>({
        name: city,
        slug: slugify(city, slugifyOptions),
      }))
    });
  } catch (error) {
    console.log(error);
  }
};

export { generateCities };
