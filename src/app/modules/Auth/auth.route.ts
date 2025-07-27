import express from "express";
import { authController } from "./auth.controller";
import auth from "../../middlewares/auth";
import { userRole } from "../../../generated/prisma";

const router = express.Router();

router.post('/login', authController.loginUser);
router.post('/refresh-token', authController.refreshToken);
router.post('/change-password', auth(userRole.SUPER_ADMIN, userRole.ADMIN, userRole.DOCTOR, userRole.PATIENT), authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);



export const authRoutes = router;