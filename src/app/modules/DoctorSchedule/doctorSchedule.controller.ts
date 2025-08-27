import { Request, Response } from "express";
import { sendResponse } from "../../../Shared/sendResponse";
import { catchAsync } from "../../middlewares/catchAsync";
import { doctorScheduleServices } from "./doctorSchedule.services";
import { IAuthUser } from "../../interfaces/common";
import pick from "../../../Shared/pick";
import { scheduleFilterableFields } from "./doctorSchedule.constant";
import httpStatus from 'http-status'
const createDoctorSchedule = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req?.user as IAuthUser;
    const result = await doctorScheduleServices.createDoctorSchedule(
      user,
      req.body
    );
    sendResponse(res, {
   statusCode:httpStatus.OK,
      success: true,
      message: "Doctor schedule Create successfully",
      data: result,
    });
  }
);
const getAllDoctorSchedule = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, scheduleFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await doctorScheduleServices.getAllDoctorSchedule(filters, options);
  sendResponse(res, {
 statusCode:httpStatus.OK,
    success: true,
    message: "Doctor Schedule retrieval successfully",
    meta: result.meta,
    data: result.data,
  });
});
const getMySchedule = catchAsync(
  async (req: Request & { user: IAuthUser | null }, res: Response) => {
    const filters = pick(req.query, ["startDate", "endDate", "isBooked"]);
    const options = pick(req.query, ["page", "limit", "sortOrder", "sortBy"]);
    const user = req?.user;
    const result = await doctorScheduleServices.getMySchedule(
      filters,
      options,
      user
    );
    sendResponse(res, {
   statusCode:httpStatus.OK,
      success: true,
      message: "My Schedule retrieved successfully",
      data: result,
    });
  }
);
const deleteDoctorSchedule = catchAsync(
  async (req: Request & { user: IAuthUser | null }, res: Response) => {
    const { id } = req?.params;
    const user = req?.user as IAuthUser;
    const result = await doctorScheduleServices.deleteDoctorSchedule(id, user);
    sendResponse(res, {
   statusCode:httpStatus.OK,
      success: true,
      message: "My Schedule retrieved successfully",
      data: result,
    });
  }
);
export const doctorScheduleController = {
  createDoctorSchedule,
  getMySchedule,
  deleteDoctorSchedule,
  getAllDoctorSchedule
};
