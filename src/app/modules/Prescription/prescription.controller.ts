import pick from "../../../Shared/pick";
import { sendResponse } from "../../../Shared/sendResponse";
import { IAuthUser } from "../../interfaces/common";
import { catchAsync } from "../../middlewares/catchAsync";
import { prescriptionServices } from "./prescription.services";
import { Request, Response } from "express";
import httpStatus from "http-status";
const createPrescription = catchAsync(
  async (req: Request & { user?: IAuthUser | null }, res: Response) => {
    const user = req.user as IAuthUser | null;
    const result = await prescriptionServices.createPrescription(
      user as IAuthUser,
      req.body
    );
    sendResponse(res, {
   statusCode:httpStatus.OK,
      success: true,
      message: "Prescription Generate successfully",
      data: result,
    });
  }
);
const getMyPrescription = catchAsync(async (req: Request & { user?: IAuthUser | null }, res: Response) => {
    const user = req.user as IAuthUser | null;
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])
    const result = await prescriptionServices.getMyPrescription(user as IAuthUser | null, options);
    sendResponse(res, {
     statusCode:httpStatus.OK,
        success: true,
        message: 'Prescription fetched successfully',
        meta: result.meta,
        data: result.data
    });
});
export const prescriptionController = {
  createPrescription,
  getMyPrescription,
};
