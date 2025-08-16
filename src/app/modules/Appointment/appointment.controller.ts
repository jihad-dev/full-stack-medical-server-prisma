import { Request, Response } from "express";
import { sendResponse } from "../../../Shared/sendResponse";
import { catchAsync } from "../../middlewares/catchAsync";
import { IAuthUser } from "../../interfaces/common";
import { appointmentServices } from "./appointment.services";
import pick from "../../../Shared/pick";

const createAppointment = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req?.user as IAuthUser;
    const result = await appointmentServices.createAppointment(user, req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Appointment Create successfully",
      data: result,
    });
  }
);

const getMyAppointment = catchAsync(
  async (req: Request & { user?: IAuthUser | null }, res: Response) => {
    const user = req?.user;
    const filters = pick(req.query, ["status", "paymentStatus"]);
    const options = pick(req.query, ["page", "limit", "sortOrder", "sortBy"]);
    const result = await appointmentServices.getMyAppointment(
      user as IAuthUser,
      filters,
      options
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "My Appointment retrieved successfully",
      data: result,
    });
  }
);
const getAllAppointment = catchAsync(
  async (req: Request & { user?: IAuthUser | null }, res: Response) => {
    const filters = pick(req.query, ["status", "paymentStatus"]);
    const options = pick(req.query, ["page", "limit", "sortOrder", "sortBy"]);
    const result = await appointmentServices.getAllAppointment(
      filters,
      options
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "All Appointment retrieved successfully",
      data: result,
    });
  }
);

const changeAppointmentStatus = catchAsync(async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;
    const result = await appointmentServices.changeAppointmentStatus(id, status, user as IAuthUser);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Appointment status changed successfully',
        data: result
    });
});

export const appointmentController = {
  createAppointment,
  getMyAppointment,
  changeAppointmentStatus,
  getAllAppointment,
};
