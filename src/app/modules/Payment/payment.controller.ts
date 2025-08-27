import { Request, Response } from "express";
import { sendResponse } from "../../../Shared/sendResponse";
import { catchAsync } from "../../middlewares/catchAsync";
import { paymentServices } from "./payment.service";
import httpStatus from "http-status";
const initPayment = catchAsync(async (req: Request, res: Response) => {
  const { appointmentId } = req?.params;
  const result = await paymentServices.initPayment(appointmentId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment Initiate successfully",
    data: result,
  });
});
const validatePayment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentServices.validatePayment(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment validate successfully",
    data: result,
  });
});

export const paymentController = {
  initPayment,
  validatePayment,
};
