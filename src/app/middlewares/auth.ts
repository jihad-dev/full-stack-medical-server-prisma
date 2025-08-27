import { NextFunction, Request, Response } from "express";
import config from "../../config";
import { Secret } from "jsonwebtoken";
import httpStatus from "http-status";
import AppError from "../errors/AppError";
import { verifyToken } from "../../helpers/generateToken";

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      let verifiedUser;
      try {
        verifiedUser = verifyToken(token, config.jwt_secret as Secret);
      } catch (err: any) {
        if (err.name === "TokenExpiredError") {
          return next(
            new AppError(httpStatus.UNAUTHORIZED, "Access token expired")
          );
        }
        return next(
          new AppError(httpStatus.UNAUTHORIZED, "Invalid access token")
        );
      }

      req.user = verifiedUser;

      // role check
      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new AppError(httpStatus.FORBIDDEN, "Forbidden!");
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
