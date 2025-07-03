import { Request, Response } from "express";
import { userServices } from "./user.service";

const createAdmin = async (req: Request, res: Response) => {

    try {
        const result = await userServices.createAdmin(req?.body);
        res.status(201).json({ success: true, message: 'Admin Created Successfully', data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error?.name || "Failed to create user", error });
    }
}
const createUser = async (req: Request, res: Response) => {
    try {
        const result = await userServices.createUser(req.body);
        res.status(201).json({ success: true, message: 'user Created Successfully', data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Failed to create user", error });
    }
};
export const userController = {
    createAdmin,
    createUser
}