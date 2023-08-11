import { Request, Response, NextFunction } from "express";
import orderCategoryService from "../services/orderCategoryService";

class OrderController {
  async getAll(_req: Request, res: Response, _next: NextFunction) {
    try {
      const orderCategories = await orderCategoryService.getAll();
      return res.json(orderCategories);
    } catch (error) {
      return res.status(400).send({
        message: "This is an error!",
      });
    }
  }
  async getOneBySlug(req: Request, res: Response, _next: NextFunction) {
    try {
      const { categorySlug } = req.params;
      const orderCategories = await orderCategoryService.getOneBySlug(
        categorySlug
      );
      return res.json(orderCategories);
    } catch (error) {
      return res.status(400).send({
        message: "This is an error!",
      });
    }
  }
}

export default new OrderController();
