import express from "express";
import authController from "../controllers/authController";
const authRouter = express.Router();

authRouter.post("/registerationByEmail", authController.registrationByEmail);
authRouter.patch('/activateLinkByEmail/:activationLink', authController.activateLinkByEmail)
authRouter.post('/loginByEmail',  authController.loginByEmail)
authRouter.post('/logout', authController.logout)
authRouter.get('/refresh', authController.refresh)
// запрос на сброс
authRouter.post('/forgotPassword', authController.forgotPassword)
// Проверка ссылки
authRouter.get('/forgotPassword/:resetPasswordLink/check', authController.forgotPasswordLinkCheck)
// Установка нового пароля
authRouter.post('/forgotPassword/:resetPasswordLink', authController.forgotPasswordReset)

export default authRouter
