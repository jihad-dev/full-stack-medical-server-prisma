import { Request, Response } from "express";
import { sendResponse } from "../../../Shared/sendResponse";
import { catchAsync } from "../../middlewares/catchAsync";
import httpStatus  from 'http-status';
import { IAuthUser } from "../../interfaces/common";
import { metaServices } from "./meta.services";

const fetchDashboardMetaData = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req?.user as IAuthUser;
    const result = await metaServices.fetchDashboardMetaData(user);
    sendResponse(res, {
   statusCode:httpStatus.OK,
      success: true,
      message: "fetchDashboardMetaData successfully",
      data: result,
    });
  }
);


export const metaController = {
 fetchDashboardMetaData
};
