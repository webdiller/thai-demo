import express from "express";
import postCategoryController from "../controllers/postCategoryController";
const postCategoryRouter = express.Router();

postCategoryRouter.post("/", postCategoryController.getAll);
postCategoryRouter.get("/paths", postCategoryController.getPaths);
postCategoryRouter.post("/:slug", postCategoryController.getOneBySlug);

export default postCategoryRouter;
