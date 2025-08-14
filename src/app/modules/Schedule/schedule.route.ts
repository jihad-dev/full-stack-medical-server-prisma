import express from "express";
import { scheduleController } from "./schedule.controller";
import auth from "../../middlewares/auth";
import { userRole } from "../../../generated/prisma";

const router = express.Router();

router.post(
  "/",
  auth(userRole.ADMIN, userRole.SUPER_ADMIN),
  scheduleController.createSchedule
);
router.get("/",  auth(userRole.DOCTOR, userRole.SUPER_ADMIN), scheduleController.getAllSchedule);
router.get("/:id", scheduleController.getSingleschedule);
router.delete("/:id", scheduleController.deleteSchedule);
export const scheduleRoutes = router;
