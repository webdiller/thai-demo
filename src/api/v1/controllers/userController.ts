import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../../exceptions/apiError";
import { RequestUser } from "../../../types";
import userService from "../services/userService";
class UserController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAll();
      return res.json(users);
    } catch (error) {
      return next(error);
    }
  }
  async getByUserId(req: RequestUser, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getByUserId(id);
      return res.json(user);
    } catch (error) {
      return next(error);
    }
  }
  async getMe(req: RequestUser, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        const user = await userService.getMe(req.user.id);
        return res.json(user);
      }
      return new ApiError(401, "Пользователь не авторизован");
    } catch (error) {
      return next(error);
    }
  }
  async updateProfile(req: RequestUser, res: Response, next: NextFunction) {
    try {
      const { contact } = req.body;
      if (req.user) {
        const user = await userService.updateProfile({
          id: `${req.user.id}`,
          contact,
        });
        return res.json(user);
      }
      return new ApiError(401, "Пользователь не авторизован");
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  async updateClient(req: RequestUser, res: Response, next: NextFunction) {
    try {
      const { content } = req.body;
      if (req.user) {
        const user = await userService.updateClient(req.user.id, content);
        return res.json(user);
      }
      return new ApiError(401, "Пользователь не авторизован");
    } catch (error) {
      return next(error);
    }
  }
}

export default new UserController();
