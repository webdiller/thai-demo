import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../../exceptions/apiError";
import { additionCookieParameters } from "../../../helpers/additionCookieParameters";
import authService from "../services/authService";

class AuthController {
  async registrationByEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const response = await authService.registrationByEmail(email, password);
      return res.json(response);
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  async activateLinkByEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { activationLink } = req.params;
      const response = await authService.activateLinkByEmail(activationLink);

      res.cookie(
        "refreshToken",
        response.tokens.refreshToken,
        additionCookieParameters
      );
      res.cookie("userId", response.id, additionCookieParameters);
      res.cookie("userRoles", response.roles, additionCookieParameters);
      return res.json(response);
    } catch (error) {
      console.log(error);
      
      return next(error);
    }
  }

  async loginByEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const response = await authService.loginByEmail(email, password);
      if (response.isActivated) {
        res.cookie(
          "refreshToken",
          response.tokens.refreshToken,
          additionCookieParameters
        );
        res.cookie("userId", response.id, additionCookieParameters);
        res.cookie("userRoles", response.roles, additionCookieParameters);
      } else {
        return next(
          ApiError.BadRequest(
            `Подтвердите регистрацию аккаунта ${email} на почте`
          )
        );
      }
      return res.json(response);
    } catch (error) {
      return next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      const response = await authService.logout(refreshToken);
      res.clearCookie("refreshToken");
      res.clearCookie("userId");
      res.clearCookie("userRoles");
      return res.json(response);
    } catch (error) {
      return next(error);
    }
  }

  /*
   * Посылаем запрос на обновление рефреш и аксесс токена
   * Если рефреш токен имеется в куках, то скрипт работает, иначе требуется ручной вход
   */
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      const response = await authService.refresh(refreshToken);

      res.cookie(
        "refreshToken",
        response.tokens.refreshToken,
        additionCookieParameters
      );
      res.cookie("userId", response.id, additionCookieParameters);
      res.cookie("userRoles", response.roles, additionCookieParameters);
      return res.json(response);
    } catch (error) {
      /* Если пользователь пытает обновить access token, а refresh токен уже протух, то удаляем из кук refreshToken */
      res.clearCookie("refreshToken");
      res.clearCookie("userId");
      res.clearCookie("userRoles");
      return next(error);
    }
  }

  /*
   * Создать ссылку на сброс пароля
   * Принимаем на почту на сброс пароля
   * Если нету данной почты в БД - ошибка
   * Иначе на почту приходит ссылка на сброс почты (роут resetEmailPassword/:hash)
   *
   * При переходе на ссылку сайта, происходит запрос в getServerSideProps с проверкой hash
   * Если данного хеша нет в бд, то редирект
   * Иначе человек остается на странице
   * На странице человек вводит новую пару паролей и посылает запрос
   * Если они не совпадаюют, то ошибка
   * При успехе - удаление ссылки на сброс пароля, обновение токенов, редирект в ЛК и тоас сообщение
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const response = await authService.forgotPassword(email);
      if (!response.isActivated) {
        return next(
          ApiError.BadRequest(
            `Подтвердите регистрацию аккаунта ${email} на почте`
          )
        );
      } else {
        return res.json(response);
      }
    } catch (error) {
      return next(error);
    }
  }
  async forgotPasswordLinkCheck(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { resetPasswordLink } = req.params;
      const response = await authService.forgotPasswordLinkCheck(
        resetPasswordLink
      );
      return res.json(response);
    } catch (error) {
      return next(error);
    }
  }
  // Обновить пароль пользователя
  async forgotPasswordReset(req: Request, res: Response, next: NextFunction) {
    try {
      const { resetPasswordLink } = req.params;
      const { newPassword, newPasswordConfirm } = req.body;
      const response = await authService.forgotPasswordReset({
        resetPasswordLink,
        newPassword,
        newPasswordConfirm,
      });
      res.cookie(
        "refreshToken",
        response.tokens.refreshToken,
        additionCookieParameters
      );
      res.cookie("userId", response.id, additionCookieParameters);
      res.cookie("userRoles", response.roles, additionCookieParameters);
      return res.json(response);
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
}

export default new AuthController();
