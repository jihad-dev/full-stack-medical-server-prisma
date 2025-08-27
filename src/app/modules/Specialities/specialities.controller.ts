import { Request, Response } from "express";
import { sendResponse } from "../../../Shared/sendResponse";
import { catchAsync } from "../../middlewares/catchAsync";
import { SpecialitiesServices } from "./specialities.service";
import httpStatus from "http-status";
import pick from "../../../Shared/pick";
const createSpecialities = catchAsync(async (req: Request, res: Response) => {
  const result = await SpecialitiesServices.insertIntoDB(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "specialities Created  successfully",
    data: result,
  });
});
const getAllSpecialities = catchAsync(async (req: Request, res: Response) => {
  const params = pick(req.query, ["title"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await SpecialitiesServices.getAllSpecilities(params, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "specialities Retreved  successfully",
    data: result,
  });
});
const deleteSpecialities = catchAsync(async (req: Request, res: Response) => {
  const result = await SpecialitiesServices.deleteSpecilities(req?.params?.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "specialities Delete  successfully",
    data: result,
  });
});

export const specialitiesController = {
  createSpecialities,
  getAllSpecialities,
  deleteSpecialities,
};
