import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
export 
const validateRequest = (schema: AnyZodObject) => async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        await schema.parseAsync({ body: req.body });
        return next();
    } catch (error) {
       
        if (error instanceof ZodError) {
            res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: error.errors,
            });
            return;
        }
        return next(error);
    }
};