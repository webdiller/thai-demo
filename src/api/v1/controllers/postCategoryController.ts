import { Request, Response, NextFunction } from "express";
import postCategoryService from "../services/postCategoryService";

class PostCategoryController {
  async getAll(req: Request, res: Response, _next: NextFunction) {
    try {
      const posts = await postCategoryService.getAll();
      return res.json(posts);
    } catch (error) {
      return res.status(400).send({
        message: "This is an error!",
      });
    }
  }

  async getPaths(_req: Request, res: Response, _next: NextFunction) {
    try {
      const posts = await postCategoryService.getPaths();
      return res.json(posts);
    } catch (error) {
      return res.status(400).send({
        message: "This is an error!",
      });
    }
  }

  async getOneBySlug(req: Request, res: Response, _next: NextFunction) {
    try {
      const { slug } = req.params;
      const post = await postCategoryService.getOneBySlug(slug);
      return res.json(post);
    } catch (error) {
      return res.status(400).send({
        message: "This is an error!",
      });
    }
  }
}

export default new PostCategoryController();
