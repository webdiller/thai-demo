import express from "express";
import authMiddleware from "../../../middleware/authMiddleware";
import orderController from "../controllers/orderController";
const orderRouter = express.Router();

orderRouter.get("/", orderController.getAll);
orderRouter.post("/query", orderController.getByQuery);
orderRouter.get("/:number", orderController.getByNumber);
orderRouter.get("/paths/categories", orderController.getPaths);
orderRouter.post("/", authMiddleware, orderController.createOne);
orderRouter.patch("/update", authMiddleware, orderController.updateOne);
orderRouter.patch("/upload", authMiddleware, orderController.uploadImage);
orderRouter.patch("/arhivateOne", authMiddleware, orderController.arhivateOne);
orderRouter.patch("/deleteImage", authMiddleware, orderController.deleteImage);

export default orderRouter;
