import { Request, Response } from "express";
import { userServices } from "./user.service";

const createAdmin = async (req: Request, res: Response, next: unknown) => {

    try {
        const result = await userServices.createAdmin(req);
        res.status(201).json({ success: true, message: 'Admin Created Successfully', data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error?.name || "Failed to create user", error });
    }
}
const createDoctor = async (req: Request, res: Response, next: unknown) => {

    try {
        const result = await userServices.createDoctor(req);
        res.status(201).json({ success: true, message: 'Doctor Created Successfully', data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error?.name || "Failed to create Doctor", error });
    }
}

export const userController = {
    createAdmin,
    createDoctor
    
}