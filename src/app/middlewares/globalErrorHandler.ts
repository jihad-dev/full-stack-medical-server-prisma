import { Request, Response, NextFunction } from "express";
import { Prisma } from "../../generated/prisma";
import config from "../../config";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";
  let details: any = null;

  // Prisma error handling
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 400;
      message = `Duplicate value for field: ${err.meta?.target}`;
      details = { field: err.meta?.target };
    }

    if (err.code === "P2025") {
      statusCode = 404;
      message = "Record not found";
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data provided to Prisma query";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.node_env === "development" && { stack: err.stack }),
    ...(details && { error: details }), // শুধু দরকারি info পাঠানো হচ্ছে
  });
};
