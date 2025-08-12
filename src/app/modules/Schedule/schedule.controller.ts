import { Request, Response } from "express";
import { sendResponse } from "../../../Shared/sendResponse";
import { catchAsync } from "../../middlewares/catchAsync";
import { scheduleServices } from "./schedule.service";

const createSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await scheduleServices.createSchedule(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "schedule Create successfully",
    data: result,
  });
});
// const getAllPatient = catchAsync(async (req: Request, res: Response) => {
//   const result = await patientServices.getAllPatient();
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "Patient Data Get successfully",
//     data: result,
//   });
// });

export const scheduleController = {
  createSchedule,
};
