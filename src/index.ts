import dotenv from "dotenv";
dotenv.config({
  debug: true
});

import express from "express";
import cors from "cors";
import fs from "fs";
import fileUpload from "express-fileupload";
import path from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import faker from "@faker-js/faker";
faker.locale = "ru";
import userRouter from "./api/v1/routes/userRouter";
import orderRouter from "./api/v1/routes/orderRouter";
import orderCategoryRouter from "./api/v1/routes/orderCategoryRouter";
import { errorMiddleware } from "./middleware/errorMiddleware";
import authRouter from "./api/v1/routes/authRouter";
import orderCityRouter from "./api/v1/routes/orderCityRouter";
import postRouter from "./api/v1/routes/postRouter";
import postCategoryRouter from "./api/v1/routes/postCategory";

let accessLogStream = fs.createWriteStream(
  path.join(process.cwd(), "api.log"),
  { flags: "a" }
);

const app = express();

/** Middleware */
app.use(express.json());
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, "../static")));
app.use(fileUpload({}));
app.use(morgan("short", { stream: accessLogStream }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/orderCategories", orderCategoryRouter);
app.use("/api/v1/orderCities", orderCityRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/postCategories", postCategoryRouter);

app.use(errorMiddleware);

if (!fs.existsSync("./static")) {
  fs.mkdirSync("./static");
}

app.listen(process.env.PORT, async () => {
  console.log(`ENV: ${process.env.NODE_ENV}`);
  console.log(`🚀 Server ready at: ${process.env.API_HOST}`);
  console.log(`auth: ${process.env.API_HOST}/api/v1/auth`);
  console.log(`users: ${process.env.API_HOST}/api/v1/users`);
  console.log(`orders: ${process.env.API_HOST}/api/v1/orders`);
  console.log(`orderCategories : ${process.env.API_HOST}/api/v1/orderCategories`);
  console.log(`orderCities : ${process.env.API_HOST}/api/v1/orderCities`);
  try {
  } catch (error: any) {
    console.log(error?.message);
  }
});
