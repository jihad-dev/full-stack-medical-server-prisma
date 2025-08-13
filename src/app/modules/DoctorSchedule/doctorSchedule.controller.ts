import { Request, Response } from "express";
import { sendResponse } from "../../../Shared/sendResponse";
import { catchAsync } from "../../middlewares/catchAsync";
import { doctorScheduleServices } from "./doctorSchedule.services";
import { IAuthUser } from "../../interfaces/common";
import pick from "../../../Shared/pick";

const createDoctorSchedule = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req?.user as IAuthUser;
    const result = await doctorScheduleServices.createDoctorSchedule(
      user,
      req.body
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Doctor schedule Create successfully",
      data: result,
    });
  }
);
const getMySchedule = catchAsync(
  async (req: Request & { user: IAuthUser | null }, res: Response) => {
    const filters = pick(req.query, ['startDate','endDate','isBooked']);
    const options = pick(req.query, ["page", "limit", "sortOrder", "sortBy"]);
    const user = req?.user;
    const result = await doctorScheduleServices.getMySchedule(
      filters,
      options,
      user
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "My Schedule retrieved successfully",
      data: result,
    });
  }
);
export const doctorScheduleController = {
  createDoctorSchedule,
  getMySchedule
};
