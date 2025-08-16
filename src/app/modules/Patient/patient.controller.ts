import { Request, Response } from "express";
import { sendResponse } from "../../../Shared/sendResponse";
import { catchAsync } from "../../middlewares/catchAsync";
import { patientServices } from "./patient.service";
import pick from "../../../Shared/pick";
import { patientFilterableFields } from "./patient.constant";

const getAllPatient = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, patientFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await patientServices.getAllPatient(filters, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Patient retrieval successfully",
    meta: result.meta,
    data: result.data,
  });
});
const getSinglePatient = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await patientServices.getSinglePatient(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Single Patient Data Get successfully",
    data: result,
  });
});
const SoftDeletePatient = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await patientServices.SoftdeletePatient(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Patient Data Deleted successfully!",
    data: result,
  });
});
const HardDeletePatient = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await patientServices.HardDeletePatient(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: " Patient Data Deleted successfully",
    data: result,
  });
});
const updatePatientInfo = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await patientServices.updatePatientInfo(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: " PatientInfo update successfully",
    data: result,
  });
});

export const patientController = {
  getAllPatient,
  getSinglePatient,
  updatePatientInfo,
  SoftDeletePatient,
  HardDeletePatient,
};
