import { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import { ApiError } from "../exceptions/apiError";

const errorMiddleware = (
  error: ErrorRequestHandler,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof ApiError) {
    return res
      .status(error.status)
      .json({ message: error.message, errors: error.errors });
  }
  return res
    .status(500)
    .json({ message: "Непредвиденная ошибка", error: error.name });
};
export { errorMiddleware };
