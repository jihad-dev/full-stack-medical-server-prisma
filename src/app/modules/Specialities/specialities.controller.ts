import { Request, Response } from "express";
import { sendResponse } from "../../../Shared/sendResponse";
import { catchAsync } from "../../middlewares/catchAsync";
import { SpecialitiesServices } from "./specialities.service";
const createSpecialities = catchAsync(async (req: Request, res: Response) => {
  const result = await SpecialitiesServices.insertIntoDB(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "specialities Created  successfully",
    data: result,
  });
});
const getAllSpecialities = catchAsync(async (req: Request, res: Response) => {
  const result = await SpecialitiesServices.getAllSpecilities();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "specialities Retreved  successfully",
    data: result,
  });
});
const deleteSpecialities = catchAsync(async (req: Request, res: Response) => {
  const result = await SpecialitiesServices.deleteSpecilities(req?.params?.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "specialities Retreved  successfully",
    data: result,
  });
});

export const specialitiesController = {
  createSpecialities,
  getAllSpecialities,
  deleteSpecialities
};
