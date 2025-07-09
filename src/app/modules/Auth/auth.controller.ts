import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/catchAsync";
import { authServices } from "./auth.services";
import { sendResponse } from "../../../Shared/sendResponse";

const loginUser = catchAsync(async (req: Request, res: Response) => {
    const { accessToken, refreshToken, needPasswordChange } = await authServices.loginUser(req.body);
    res.cookie('refreshToken', refreshToken, {
        secure: false, //TODO
        httpOnly: true
    })
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "user login  successfully",
        data: {
            accessToken,
            needPasswordChange
        },
    })
})
const refreshToken = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    const result = await authServices.refreshToken(refreshToken);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "user login  successfully",
        data: result
    })
})




export const authController = {
    loginUser,
    refreshToken
}