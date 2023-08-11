interface ICookieOptions {
  maxAge?: number | undefined;
  signed?: boolean | undefined;
  expires?: Date | undefined;
  httpOnly?: boolean | undefined;
  path?: string | undefined;
  domain?: string | undefined;
  secure?: boolean | undefined;
  encode?: ((val: string) => string) | undefined;
  sameSite?: boolean | "lax" | "strict" | "none" | undefined;
}

const additionCookieParameters: ICookieOptions = {
  maxAge: 30 * 24 * 60 * 60 * 1000,
  signed: undefined,
  expires: undefined,
  httpOnly: true, // Для предотвращения доступа из javascript клиента
  path: "/", // Для всех страниц
  domain: process.env.NODE_ENV === "development" ? undefined : ".thaibays.com", // Для всех поддоменов
  secure: process.env.NODE_ENV === "development" ? false : true, // Для ssl и https
  encode: undefined,
  sameSite: process.env.NODE_ENV === "production" ? "strict" : false, // Strict || Lax || None
};

export { additionCookieParameters };
