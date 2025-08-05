import { Request, Response } from "express";
import { userServices } from "./user.service";
import { catchAsync } from "../../middlewares/catchAsync";
import { userFilterableFields } from "./user.constant";
import pick from "../../../Shared/pick";
import { sendResponse } from "../../../Shared/sendResponse";
import { IPaginationOptions } from "../../../helpers/pagination";

const createAdmin = async (req: Request, res: Response, next: unknown) => {
  try {
    const result = await userServices.createAdmin(req);
    res.status(201).json({
      success: true,
      message: "Admin Created Successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.name || "Failed to create user",
      error,
    });
  }
};
const createDoctor = async (req: Request, res: Response, next: unknown) => {
  try {
    const result = await userServices.createDoctor(req);
    res.status(201).json({
      success: true,
      message: "Doctor Created Successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.name || "Failed to create Doctor",
      error,
    });
  }
};
const createPatient = async (req: Request, res: Response, next: unknown) => {
  try {
    const result = await userServices.createPatient(req);
    res.status(201).json({
      success: true,
      message: "Patient Created Successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.name || "Failed to create Doctor",
      error,
    });
  }
};
const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortOrder", "sortBy"]);
  const result = await userServices.getAllUserFromDB(filters, options);
  sendResponse(res, {
    statusCode: 200,
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
    statusCode: 200,
    success: true,
    message: "Profile Status Changed successfully",
    data: result,
  });
});

// get my profile data

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user; // assuming userId is added to req.user by auth middleware

  const result = await userServices.getMyProfile(user);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User profile retrieved successfully",
    data: result,
  });
});

export const userController = {
  createAdmin,
  createDoctor,
  createPatient,
  getAllUser,
  changeProfileStatus,
  getMyProfile
};
