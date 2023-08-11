import {
  GetByQueryRequest,
  RequestUploadImage,
  RequestUser,
} from "./../../../types/index";
import { Request, Response, NextFunction } from "express";
import orderService from "../services/orderService";
import {
  ArhivateOneProps,
  CreateOneProps,
  GetPathsByCategoryReq,
  UpdateOneProps,
} from "../../../types/order";
import { DeleteImageFromOrderRequest } from "../../../types/seller";

class OrderController {
  async getByQuery(req: Request, res: Response, _next: NextFunction) {
    try {
      const {
        includeSubcategories,
        includeSellerProfile,
        whereCategoriesAndSubcategories,
        whereCities = [],
        page,
        take,
        orderBy,
      }: GetByQueryRequest = req.body;
      const orders = await orderService.getByQuery({
        includeSubcategories,
        includeSellerProfile,
        whereCategoriesAndSubcategories,
        whereCities,
        page,
        take,
        orderBy,
      });
      return res.json(orders);
    } catch (error) {
      return res.status(400).send({
        message: "This is an error!",
      });
    }
  }
  async getAll(_req: Request, res: Response, _next: NextFunction) {
    try {
      const orders = await orderService.getAll();
      return res.json(orders);
    } catch (error) {
      return res.status(400).send({
        message: "This is an error!",
      });
    }
  }
  async getByNumber(req: Request, res: Response, _next: NextFunction) {
    try {
      const { number } = req.params;
      const parsedNumber = parseInt(number);
      const order = await orderService.getByNumber(parsedNumber);
      return res.json(order);
    } catch (error) {
      return res.status(400).send({
        message: "This is an error!",
      });
    }
  }
  async createOne(req: RequestUser, res: Response, _next: NextFunction) {
    try {
      const {
        title,
        content,
        cityId,
        sellerProfileId,
        price,
        categoryId,
        subcategoryId,
        contact,
      }: CreateOneProps = req.body;
      const order = await orderService.createOne({
        cityId,
        title,
        content,
        sellerProfileId,
        price,
        categoryId,
        subcategoryId,
        contact,
      });
      return res.json(order);
    } catch (error) {
      console.log(error);
      return res.status(400).send({
        message: "This is an error!",
      });
    }
  }
  async updateOne(req: RequestUser, res: Response, _next: NextFunction) {
    try {
      const {
        orderNumber,
        title,
        content,
        price,
        cityId,
        sellerProfileId,
        contact,
      }: UpdateOneProps = req.body;
      const updatedOrder = await orderService.updateOne({
        orderNumber,
        title,
        content,
        cityId,
        price,
        sellerProfileId,
        contact,
      });
      return res.json(updatedOrder);
    } catch (error) {
      console.log(error);
      return res.status(400).send({
        message: "This is an error!",
      });
    }
  }
  async arhivateOne(req: RequestUser, res: Response, _next: NextFunction) {
    try {
      const { orderNumber, isArhivated, sellerProfileId }: ArhivateOneProps =
        req.body;
      const order = await orderService.arhivateOne({
        orderNumber,
        isArhivated,
        sellerProfileId,
      });
      return res.json(order);
    } catch (error) {
      console.log(error);
      return res.status(400).send({
        message: "This is an error!",
      });
    }
  }
  async uploadImage(
    req: RequestUploadImage,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (
        !req.files ||
        !req.files?.image ||
        !req?.user ||
        !req.body.orderNumber ||
        !req.body.groupId ||
        !req.body.serialNumber ||
        !req.body.isUploaded
      ) {
        return res.status(400).json({ message: "No image uploaded" });
      } else {
        const image = Array.isArray(req.files.image)
          ? req.files.image[0]
          : req.files.image;
        const uploadedImage = await orderService.uploadImage({
          image: image,
          orderNumber: req.body.orderNumber,
          groupId: req.body.groupId,
          serialNumber: req.body.serialNumber,
          isUploaded: req.body.isUploaded,
          userId: req.user.id,
        });
        return res.status(200).json(uploadedImage);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        groupId,
        orderNumber,
        sellerProfileId,
        rootImageId,
      }: DeleteImageFromOrderRequest = req.body;
      const deletedImage = await orderService.deleteImage({
        groupId,
        orderNumber,
        sellerProfileId,
        rootImageId,
      });
      return res.status(200).json(deletedImage);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  async getPaths(_req: Request, res: Response, next: NextFunction) {
    try {
      const paths = await orderService.getPaths();
      return res.status(200).json(paths);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default new OrderController();
