import { Request, Response } from "express";
import { sendResponse } from "../../../Shared/sendResponse";
import { catchAsync } from "../../middlewares/catchAsync";
import { scheduleServices } from "./schedule.service";
import pick from "../../../Shared/pick";
import { scheduleFilterableFields } from "./schedule.constant";
import { IAuthUser } from "../../interfaces/common";

const createSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await scheduleServices.createSchedule(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "schedule Create successfully",
    data: result,
  });
});

const getAllSchedule = catchAsync(
  async (req: Request & { user: IAuthUser | null }, res: Response) => {
    const filters = pick(req.query, scheduleFilterableFields);
    const options = pick(req.query, ["page", "limit", "sortOrder", "sortBy"]);
    const user = req?.user;
    const result = await scheduleServices.getAllSchedule(
      filters,
      options,
      user 
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Schedule retrieved successfully",
      data: result,
    });
  }
);

export const scheduleController = {
  createSchedule,
  getAllSchedule,
};
