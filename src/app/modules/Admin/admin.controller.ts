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

export const adminController = {
    getAllAdmin
}