import express from "express";
import orderCityController from "../controllers/orderCityController";
const orderCityRouter = express.Router();

orderCityRouter.get("/", orderCityController.getAll);

export default orderCityRouter;
