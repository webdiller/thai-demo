import prisma from "../libs/prisma";
class OrderCityService {
  async getAll() {
    const cities = await prisma.city.findMany({
      include: {
        _count: {
          select: {
            order: true
          }
        },
      },
    });
    return cities;
  }
}

export default new OrderCityService();
