import { Request, Response } from "express";
import { sendResponse } from "../../../Shared/sendResponse";
import { catchAsync } from "../../middlewares/catchAsync";
import { doctorScheduleServices } from "./doctorSchedule.services";
import { IAuthUser } from "../../interfaces/common";

const createDoctorSchedule = catchAsync(async (req: Request & { user?: IAuthUser | null }, res: Response) => {
  const user = req?.user;
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
});

export const doctorScheduleController = {
  createDoctorSchedule,
};
