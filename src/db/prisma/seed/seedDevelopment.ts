import { PrismaClient } from "@prisma/client";
import { generateOrderCategories } from "./generateOrderCategories";
import { generateOrders } from "./generateOrders";
import { generateRoles } from "./generateRoles";
import { generateProfiles } from "./generateProfiles";
import { generateCities } from "./generateCities";
import { generateCategoriesForPosts } from "./generateCategoriesForPosts";
import { generatePosts } from "./generatePosts";
const prisma = new PrismaClient();
async function main() {
  await generateRoles();
  console.log("generateRoles END");
  await generateCities();
  console.log("generateCities END");
  await generateOrderCategories();
  console.log("generateOrderCategories END");
  await generateProfiles();
  console.log("generateProfiles END");
  await generateOrders(500);
  console.log("generateOrders END");
  await generateCategoriesForPosts();
  console.log("generateCategoriesForPosts END");
  await generatePosts(50);
  console.log("generatePosts END");
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
