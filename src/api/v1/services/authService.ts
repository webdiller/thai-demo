import { Prisma } from "@prisma/client";
import prisma from "../libs/prisma";
import bcrypt from "bcrypt";
import mailService from "./mailService";
import tokenService from "./tokenService";
import { v4 as uuidv4 } from "uuid";
import { ApiError } from "../../../exceptions/apiError";
import { USER_ROLES_NAMES } from "../../../shared/consts";

const userSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  email: true,
  isActivated: true,
  roles: true,
});

class AuthService {
  /**
   * Пользователь указывает почту и пароль
   * После, приходит приглашение на почту на регистрацию акаунта в БД
   * Пользователь нажимает на ссылку в почте, попадает на специальную страницу сайта.
   * На спец.странице сайта, происходит POST метод activateLinkByEmail
   *
   */
  async registrationByEmail(email: string, password: string) {
    /** 1. Ищем кандидата */
    const candidate = await prisma.user.findUnique({
      where: {
        email,
      },
      select: userSelect,
    });

    /** 1.1 Если есть, то отменяем */
    if (candidate) {
      throw new ApiError(400, `Пользователь с email: ${email} уже существует`);
    }

    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuidv4();

    /** 2. Создаем пользователя */
    const user = await prisma.user.create({
      data: {
        email,
        password: hashPassword,
        activationLink: activationLink,
      },
      select: userSelect,
    });

    /** 5. Отправляем информацию на почту */
    await mailService.registrationByEmail(email, activationLink);
    return user;
  }

  async activateLinkByEmail(activationLink: string) {
    /* 1. Ищем кандидата */
    const user = await prisma.user.findFirst({
      where: {
        activationLink,
      },
      select: userSelect,
    });

    /* 2. Если нету, то ошибка */
    if (!user) {
      throw ApiError.BadRequest("Пользователь не найден");
    }

    /* 2. Если уже активирован, то ошибка */
    if (user.isActivated) {
      throw ApiError.BadRequest("Пользователь уже активирован");
    }

    const getUserRole = await prisma.userRole.findUnique({
      where: {
        name: USER_ROLES_NAMES.USER
      }
    })

    /* 3. Обновляем статус профиля и создаем профиль */
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isActivated: true,
        activationLink: "",
        roles: {
          connect: {
            id: getUserRole?.id
          }
        },
        profile: {
          create: {
            contact: {
              create: {},
            },
            sellerProfile: {
              create: {},
            },
            clientProfile: {
              create: {},
            },
          },
        },
      },
      select: userSelect,
    });

    /* 4. Генерируем токены */
    const tokens = tokenService.generateToken(updatedUser);

    /* 5. Обновляем токены в БД */
    const generatedTokens = await tokenService.saveTokens(
      updatedUser.id,
      tokens.refreshToken,
      tokens.accessToken
    );

    let responsUser = { ...updatedUser, tokens: { ...generatedTokens } };
    return responsUser;
  }

  async loginByEmail(email: string, password: string) {
    /* 1. Ищем кандидата */
    const candidate = await prisma.user.findUnique({
      where: {
        email,
      },

      select: { ...userSelect, password: true },
    });

    /* 2. Если нету, то ошибка */
    if (!candidate) {
      throw ApiError.BadRequest(`Пользователь с email: ${email} не найден`);
    }

    /* Проверка пароля */
    const isCompare = await bcrypt.compare(password, candidate.password);

    if (!isCompare) {
      throw ApiError.BadRequest(`Пароль неверный`);
    }

    /* 3. Генерируем токены */
    const tokens = tokenService.generateToken(candidate);

    /* 4. Обновляем токены в БД */
    const generatedTokens = await tokenService.saveTokens(
      candidate.id,
      tokens.refreshToken,
      tokens.accessToken
    );

    const { id, email: userEmail, isActivated, roles, ...rest } = candidate;
    let user = { ...{ id, email: userEmail, isActivated, roles }, tokens: { ...generatedTokens } };
    return user;
  }

  async logout(refreshToken: string) {
    if (!refreshToken) {
      throw ApiError.BadRequest(`Вы уже разлогинены`);
    }
    const existToken = await prisma.token.findFirst({
      where: { refreshToken },
    });

    if (!existToken) {
      throw ApiError.BadRequest(`Вы уже разлогинены`);
    }
    const deletedToken = await prisma.token.delete({
      where: {
        id: existToken.id,
      },
      select: {
        userId: true,
      },
    });

    return deletedToken;
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const validate = tokenService.validateRefreshToken(refreshToken);
    const token = await tokenService.findToken(refreshToken);

    if (!token || !validate) {
      throw ApiError.UnauthorizedError();
    }

    const user = await prisma.user.findUnique({
      where: {
        id: token.userId,
      },
      select: userSelect,
    });

    if (!user) {
      throw ApiError.UnauthorizedError();
    }

    const tokens = tokenService.generateToken(user);
    const generatedTokens = await tokenService.saveTokens(
      user.id,
      tokens.refreshToken,
      tokens.accessToken
    );

    return {
      ...user,
      tokens: {
        ...generatedTokens,
      },
    };
  }

  // Отправить ссылку сброса пароля на почту
  async forgotPassword(email: string) {
    /** 1. Ищем кандидата */
    const candidate = await prisma.user.findUnique({
      where: {
        email,
      },
      select: userSelect,
    });

    /** 1. Если нету, то отменяем */
    if (!candidate) {
      throw ApiError.BadRequest(`Пользователь с email: ${email} не существует`);
    }

    const resetPasswordLink = uuidv4();

    /** Создаем ссылку */
    const updatedUser = await prisma.user.update({
      where: {
        email,
      },
      data: {
        resetPasswordLink,
      },
    });

    /** 3. Отправляем информацию на почту */
    await mailService.sendInvitationToResetPassword(email, resetPasswordLink);
    return { email: updatedUser.email, isActivated: updatedUser.isActivated };
  }

  async forgotPasswordLinkCheck(resetPasswordLink: string) {
    const user = await prisma.user.findUnique({
      where: {
        resetPasswordLink,
      },
    });

    if (!user) {
      throw ApiError.BadRequest("Недействительная ссылка на сброс паролей");
    } else {
      return {
        id: user.id,
        email: user.email,
        resetPasswordLink: user.resetPasswordLink,
      };
    }
  }

  // Обновить пароль пользователя
  async forgotPasswordReset({
    resetPasswordLink,
    newPassword,
    newPasswordConfirm,
  }: {
    resetPasswordLink: string;
    newPassword: string;
    newPasswordConfirm: string;
  }) {
    /* 1. Ищем кандидата */
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordLink,
      },
      select: userSelect,
    });

    /* 2. Если нету, то ошибка */
    if (!user) {
      throw ApiError.BadRequest("Недействительная ссылка на сброс паролей");
    }

    /* Проверка на совпадение паролей */
    if (newPassword !== newPasswordConfirm) {
      throw ApiError.BadRequest("Пароли не совпадают");
    }

    /* Хешируем пароль */
    const hashPassword = await bcrypt.hash(newPassword, 3);

    /* Обновляем пароль в БД */
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashPassword,
        resetPasswordLink: "",
      },
      select: userSelect,
    });

    /* 4. Генерируем  новые токены */
    const tokens = tokenService.generateToken(updatedUser);

    /* 5. Обновляем токены в БД */
    const generatedTokens = await tokenService.saveTokens(
      updatedUser.id,
      tokens.refreshToken,
      tokens.accessToken
    );
    let responseUser = { ...updatedUser, tokens: { ...generatedTokens } };
    return responseUser;
  }
}

export default new AuthService();
