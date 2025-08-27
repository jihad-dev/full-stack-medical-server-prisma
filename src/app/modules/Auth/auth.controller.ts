import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/catchAsync";
import { authServices } from "./auth.services";
import { sendResponse } from "../../../Shared/sendResponse";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import config from "../../../config";


const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await authServices.loginUser(req.body);
    res.cookie('refreshToken', result.refreshToken, {
      secure: config.node_env === 'production',
      httpOnly: true,  
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User logged in successfully",
      data: {
        accessToken: result.accessToken,
        needPasswordChange: result.needPasswordChange
      },
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: error.message,
      data: error,
    });
  }
};

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    throw new AppError(httpStatus.UNAUTHORIZED, "No refresh token provided!");
  }
  const result = await authServices.refreshToken(refreshToken);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "New access token generated successfully",
    data: {
      accessToken:result.accessToken
    },
  });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged out successfully!",
    data: null,
  });
});

const changePassword = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await authServices.changePassword(req.user, req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password Changed  successfully",
      data: result,
    });
  }
);
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.forgotPassword(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Check Your Email!!",
    data: result,
  });
});
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";
  await authServices.resetPassword(token, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
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
  logoutUser,
};
