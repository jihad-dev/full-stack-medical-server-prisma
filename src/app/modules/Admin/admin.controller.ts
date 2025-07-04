import pick from "../../../Shared/pick";
import { adminFilterableFields } from "./admin.constant";
import { adminServices } from "./admin.service";
import { Request, Response } from 'express';

const getAllAdmin = async (req: Request, res: Response) => {
    try {

        const filters = pick(req.query, adminFilterableFields);
        const options = pick(req.query, ['page', 'limit', 'sortOrder', 'sortBy']);
        const result = await adminServices.getAllAdminFromDB(filters, options);
        res.status(201).json({ success: true, message: 'Admin get Successfully', data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error?.name || "Failed to get data", error });
    }
}
const getSingleDataById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req?.params?.id;
        const result = await adminServices.getSingleDataById(id);

        if (!result) {
            res.status(404).json({
                success: false,
                message: 'Data not found with the given ID',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Admin single data fetched successfully',
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error?.message || "Failed to get data",
            error: error?.stack || error,
        });
    }
};


const updateIntoDB = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;
        const data = req.body;

        const result = await adminServices.updateIntoDB(id, data);

        res.status(200).json({
            success: true,
            message: 'Admin data updated successfully',
            data: result,
        });
    } catch (error: any) {
        // Handle "record not found" error from Prisma
        const statusCode = error?.name === 'NotFoundError' ? 404 : 500;

        res.status(statusCode).json({
            success: false,
            message: error?.message || 'Failed to update data',
            error: error?.stack || error,
        });
    }
};

const deleteIntoDB = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;

        const result = await adminServices.deleteIntoDB(id);

        res.status(200).json({
            success: true,
            message: 'Admin data deleted successfully',
            data: result,
        });
    } catch (error: any) {
        const statusCode = error?.message === 'Admin not found' ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error?.message || 'Failed to delete data',
            error: error?.stack || error,
        });
    }
};
export const adminController = {
    getAllAdmin,
    getSingleDataById,
    updateIntoDB,
    deleteIntoDB
}