import express from "express";
import orderCategoryController from "../controllers/orderCategoryController";
const router = express.Router();

router.get("/", orderCategoryController.getAll);
router.get("/:categorySlug", orderCategoryController.getOneBySlug);

export default router;
