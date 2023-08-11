import { Request, Response, NextFunction } from "express";
import postService from "../services/postService";
import { CreatePostProps, CreatePostRequest } from "src/types/post/createPost";

interface CreatePostRequestProps extends Request {
  body: {
    title: string;
  };
}

class PostController {
  async getAll(req: Request, res: Response, _next: NextFunction) {
    try {
      const { count, minify } = req.body;
      const posts = await postService.getAll(count, minify);
      return res.json(posts);
    } catch (error) {
      return res.status(400).send({
        message: "This is an error!",
      });
    }
  }

  async getPaths(_req: Request, res: Response, _next: NextFunction) {
    try {
      const posts = await postService.getPaths();
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
      const post = await postService.getOneBySlug(slug);
      return res.json(post);
    } catch (error) {
      return res.status(400).send({
        message: "This is an error!",
      });
    }
  }

  async getOneByCategorySlugAndSlug(
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const { categorySlug, slug } = req.params;
      const post = await postService.getOneByCategorySlugAndSlug(
        categorySlug,
        slug
      );
      return res.json(post);
    } catch (error) {
      return res.status(400).send({
        message: "This is an error!",
      });
    }
  }

  async updateCount(req: Request, res: Response, _next: NextFunction) {
    try {
      const { postSlug } = req.params;
      const post = await postService.updateCount(postSlug);
      return res.json(post);
    } catch (error) {
      return res.status(400).send({
        message: "This is an error!",
      });
    }
  }
  async deleteOne(req: Request, res: Response, _next: NextFunction) {
    try {
      const { postSlug } = req.params;
      const post = await postService.deleteOne(postSlug);
      return res.json(post);
    } catch (error) {
      return res.status(400).send({
        message: "This is an error!",
      });
    }
  }
  async createPost(req: CreatePostRequest, res: Response, _next: NextFunction) {
    try {
      const { title, slug, content, excerpt, postCategoryId, profileId } = req.body;
      const post = await postService.createPost({title, slug, content, excerpt, postCategoryId, profileId});
      return res.json(post);
    } catch (error) {
      return res.status(400).send({
        message: "This is an error!",
      });
    }
  }
}

export default new PostController();
