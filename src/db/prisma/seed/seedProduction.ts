import { PrismaClient } from "@prisma/client";
import { generateOrderCategories } from "./generateOrderCategories";
import { generateRoles } from "./generateRoles";
import { generateCities } from "./generateCities";
import { generateCategoriesForPosts } from "./generateCategoriesForPosts";
const prisma = new PrismaClient();
async function main() {
  await generateRoles();
  console.log("generateRoles END");
  await generateCities();
  console.log("generateCities END");
  await generateOrderCategories();
  console.log("generateOrderCategories END");
  await generateCategoriesForPosts();
  console.log("generateCategoriesForPosts END");
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
