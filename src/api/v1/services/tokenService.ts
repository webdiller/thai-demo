import { Prisma } from "@prisma/client";
import { UserDTOProps } from "../../../types";
import prisma from "../libs/prisma";
import jwt from "jsonwebtoken";

const JWT_ACCESS_TOKEN = `${process.env.JWT_ACCESS_TOKEN}`;
const JWT_REFRESH_TOKEN = `${process.env.JWT_REFRESH_TOKEN}`;

class TokenService {
  generateToken({ email, id, isActivated, roles }: UserDTOProps) {
    const accessToken = jwt.sign(
      { id, email, isActivated, roles },
      JWT_ACCESS_TOKEN,
      {
        expiresIn: "30m",
      }
    );
    const refreshToken = jwt.sign(
      { id, email, isActivated, roles },
      JWT_REFRESH_TOKEN,
      {
        expiresIn: "30d",
      }
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  validateAccessToken(token: string) {
    try {
      const user = jwt.verify(token, JWT_ACCESS_TOKEN);
      return user;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  validateRefreshToken(token: string) {
    try {
      const user = jwt.verify(token, JWT_REFRESH_TOKEN);
      return user;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async findToken(refreshToken: string) {
    return await prisma.token.findFirst({ where: { refreshToken } });
  }

  async saveTokens(userId: string, refreshToken: string, accessToken: string) {
    const existToken = await prisma.token.findFirst({
      where: {
        userId,
      },
    });

    if (existToken) {
      const token = await prisma.token.update({
        where: {
          userId,
        },
        data: {
          refreshToken,
          accessToken,
        },
        select: {
          refreshToken: true,
          accessToken: true,
        },
      });
      return token;
    } else {
      const token = await prisma.token.create({
        data: {
          userId,
          refreshToken,
          accessToken,
        },
        select: {
          refreshToken: true,
          accessToken: true,
        },
      });
      return token;
    }
  }
}

export default new TokenService();
