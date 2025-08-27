import { Request, Response } from "express";
import { sendResponse } from "../../../Shared/sendResponse";
import { catchAsync } from "../../middlewares/catchAsync";
import { doctorServices } from "./doctor.service";
import pick from "../../../Shared/pick";
import { doctorFilterableFields } from "./doctor.constant";
import httpStatus from "http-status";
const getAllDoctor = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, doctorFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortOrder", "sortBy"]);
  const result = await doctorServices.getAllDoctor(filters, options);
  sendResponse(res, {
 statusCode:httpStatus.OK,
    success: true,
    message: "Doctor Data Get successfully",
    data: result,
  });
});
const getSingleDoctor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await doctorServices.getSingleDoctor(id);
  sendResponse(res, {
 statusCode:httpStatus.OK,
    success: true,
    message: "Single Doctor Data Get successfully",
    data: result,
  });
});
const deleteDoctor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await doctorServices.deleteDoctor(id);
  sendResponse(res, {
 statusCode:httpStatus.OK,
    success: true,
    message: " Doctor Data Deleted successfully",
    data: result,
  });
});
const HardDeleteDoctor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await doctorServices.HardDeleteDoctor(id);
  sendResponse(res, {
 statusCode:httpStatus.OK,
    success: true,
    message: " Doctor Data Deleted successfully",
    data: result,
  });
});
const updateDoctorInfo = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await doctorServices.updateDoctorInfo(id, req.body);
  sendResponse(res, {
 statusCode:httpStatus.OK,
    success: true,
    message: "updateDoctorInfo   successfully",
    data: result,
  });
});

export const doctorController = {
  updateDoctorInfo,
  getSingleDoctor,
  getAllDoctor,
  deleteDoctor,
  HardDeleteDoctor,
};
