import { Request, Response, NextFunction } from "express";
import tokenService from "../api/v1/services/tokenService";
import { ApiError } from "../exceptions/apiError";

/** Проверка, авторизован ли пользователь */
export default async function (req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const { userId } = req.cookies;
    if (!authHeader || !userId) {
      return next(ApiError.UnauthorizedError())
    }
    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
      return next(ApiError.UnauthorizedError())
    }
    const userData = tokenService.validateAccessToken(accessToken);
    if (!userData) {
      return next(ApiError.UnauthorizedError())
    }
    // FIXME: Add types for userdata
    // @ts-ignore
    if (userData.id !== userId) {
      return next(ApiError.BadRequest("Нет прав на выполнение запроса"))
    }
    
    // FIXME: Add types for req
    // @ts-ignore
    req.user = userData
    next();
  } catch (error) {
    return next(ApiError.UnauthorizedError())
  }
}