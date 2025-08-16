import { Request, Response } from "express";

import { ReviewService } from "./review.services";
import { IAuthUser } from "../../interfaces/common";
import { sendResponse } from "../../../Shared/sendResponse";
import { catchAsync } from "../../middlewares/catchAsync";
import pick from "../../../Shared/pick";
import { reviewFilterableFields } from "./review.constant";

const insertIntoDB = catchAsync(async (req: Request & { user?: IAuthUser }, res: Response) => {
    const user = req.user;
    const result = await ReviewService.insertIntoDB(user as IAuthUser, req.body);
    sendResponse(res, {
        statusCode:200,
        success: true,
        message: 'Review created successfully',
        data: result,
    });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, reviewFilterableFields);
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await ReviewService.getAllFromDB(filters, options);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Reviews retrieval successfully',
        meta: result.meta,
        data: result.data,
    });
});


export const ReviewController = {
    insertIntoDB,
    getAllFromDB
}