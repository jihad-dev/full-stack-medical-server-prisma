import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/catchAsync";
import { authServices } from "./auth.services";
import { sendResponse } from "../../../Shared/sendResponse";
import config from "../../../config";

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { accessToken, refreshToken, needPasswordChange } =
    await authServices.loginUser(req.body);
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.env === "production",
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User logged in successfully",
    data: {
      accessToken,
      needPasswordChange,
    },
  });
});
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  const result = await authServices.refreshToken(refreshToken);
  sendResponse(res, {
    statusCode: 200,
    success: true,
   message: "New access token generated successfully",
    data: result,
  });
});
const changePassword = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await authServices.changePassword(req.user, req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Password Changed  successfully",
      data: result,
    });
  }
);
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.forgotPassword(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Check Your Email!!",
    data: result,
  });
});
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";
  await authServices.resetPassword(token, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password Reset Successfully!!",
    data: null,
  });
});

export const authController = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
