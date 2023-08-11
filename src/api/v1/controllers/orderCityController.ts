import { Request, Response, NextFunction } from "express";
import orderCityService from "../services/orderCityService";

class OrderCityController {
  async getAll(_req: Request, res: Response, _next: NextFunction) {
    try {
      const orderCities = await orderCityService.getAll();
      return res.json(orderCities);
    } catch (error) {
      return res.status(400).send({
        message: "This is an error!",
      });
    }
  }
}

export default new OrderCityController();
