import pick from "../../../Shared/pick";
import sendResponse from "../../../Shared/sendResponse";
import { catchAsync } from "../../middlewares/catchAsync";
import { adminFilterableFields } from "./admin.constant";
import { adminServices } from "./admin.service";
import { NextFunction, Request, RequestHandler, Response } from 'express';

const getAllAdmin = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, adminFilterableFields);
    const options = pick(req.query, ['page', 'limit', 'sortOrder', 'sortBy']);
    const result = await adminServices.getAllAdminFromDB(filters, options);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Admins retrieved successfully",
        data: result.data,
        meta: result.meta,
    });

})
const getSingleDataById = catchAsync(async (req: Request, res: Response): Promise<void> => {

    const id = req?.params?.id;
    const result = await adminServices.getSingleDataById(id);

    if (!result) {
        res.status(404).json({
            success: false,
            message: 'Data not found with the given ID',
        });
    }
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "single Admin retrieved successfully",
        data: result,
    });
})

const updateIntoDB = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    const data = req.body;
    const result = await adminServices.updateIntoDB(id, data);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Admins data update  successfully",
        data: result,
    });

})

const deleteIntoDB = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    const result = await adminServices.deleteIntoDB(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Admins Delete successfully",
        data: result,
    });
})








const softDeleteIntoDB = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id;

        const result = await adminServices.softDeleteIntoDB(id);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Your Account deleted successfully',
            data: result,

        });

    } catch (error: any) {
        next(error)
    }
};
export const adminController = {
    getAllAdmin,
    getSingleDataById,
    updateIntoDB,
    deleteIntoDB,
    softDeleteIntoDB
}