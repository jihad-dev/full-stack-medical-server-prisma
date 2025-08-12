import express from "express";

import auth from "../../middlewares/auth";
import { userRole } from "../../../generated/prisma";
import { doctorScheduleController } from "./doctorSchedule.controller";

const router = express.Router();

router.post(
  "/",
  auth(userRole.DOCTOR),
  doctorScheduleController.createDoctorSchedule
);
// router.get("/", scheduleController.getAllschedule);
// router.get("/:id", scheduleController.getSingleschedule);
// router.patch("/:id", scheduleController.updatescheduleInfo);
// router.delete("/soft/:id", scheduleController.SoftDeleteschedule);
// router.delete("/:id", scheduleController.HardDeleteschedule);
export const doctorScheduleRoutes = router;
