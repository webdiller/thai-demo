import express from "express";
import postController from "../controllers/postController";
import adminMiddleware from "../../../middleware/adminMiddleware";
const postRouter = express.Router();

postRouter.post("/", postController.getAll);
postRouter.get("/paths", postController.getPaths);
postRouter.post("/:slug", postController.getOneBySlug);
postRouter.post("/:postSlug/updateCount", postController.updateCount);
postRouter.delete("/:postSlug", adminMiddleware, postController.deleteOne);
postRouter.get("/:categorySlug/:slug", postController.getOneByCategorySlugAndSlug);

export default postRouter;
