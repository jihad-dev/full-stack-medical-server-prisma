import { Request, Response } from "express";
import { userServices } from "./user.service";
import { catchAsync } from "../../middlewares/catchAsync";
import { userFilterableFields } from "./user.constant";
import pick from "../../../Shared/pick";
import { sendResponse } from "../../../Shared/sendResponse";
import { IAuthUser } from "./../../interfaces/common";
import httpStatus from "http-status";

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.createAdmin(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin Created Successfully",
    data: result,
  });
});
const createDoctor = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.createDoctor(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor Created Successfully",
    data: result,
  });
});
const createPatient = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.createPatient(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient Created Successfully",
    data: result,
  });
});

const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortOrder", "sortBy"]);
  const result = await userServices.getAllUserFromDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "user retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});
const changeProfileStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userServices.changeProfileStatus(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile Status Changed successfully",
    data: result,
  });
});

// get my profile data

const getMyProfile = catchAsync(
  async (req: Request & { user?: IAuthUser | null }, res: Response) => {
    const user = req.user as IAuthUser;

    const result = await userServices.getMyProfile(user);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User profile retrieved successfully",
      data: result,
    });
  }
);
const updateMyProfile = catchAsync(
  async (req: Request & { user?: IAuthUser | null }, res: Response) => {
    const user = req.user; // assuming userId is added to req.user by auth middleware
    const result = await userServices.updateMyProfile(user as IAuthUser, req);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User profile update successfully",
      data: result,
    });
  }
);

export const userController = {
  createAdmin,
  createDoctor,
  createPatient,
  getAllUser,
  changeProfileStatus,
  getMyProfile,
  updateMyProfile,
};
