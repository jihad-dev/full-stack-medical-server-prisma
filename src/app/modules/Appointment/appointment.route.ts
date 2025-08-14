import express from "express";
import auth from "../../middlewares/auth";
import { userRole } from "../../../generated/prisma";
import { appointmentController } from "./appointment.controller";

const router = express.Router();

router.post(
  "/",
  auth(userRole.PATIENT),
  appointmentController.createAppointment
);
router.get(
  "/my-appointment",
  auth(userRole.PATIENT,userRole.DOCTOR),
  appointmentController.getMyAppointment
);
router.get(
  "/",
  auth(userRole.SUPER_ADMIN,userRole.ADMIN),
  appointmentController.getAllAppointment
);

export const appointmentRoutes = router;
