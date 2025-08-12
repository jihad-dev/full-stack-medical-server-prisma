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
router.get("/", scheduleController.getAllSchedule);
// router.get("/:id", scheduleController.getSingleschedule);
// router.patch("/:id", scheduleController.updatescheduleInfo);
// router.delete("/soft/:id", scheduleController.SoftDeleteschedule);
// router.delete("/:id", scheduleController.HardDeleteschedule);
export const scheduleRoutes = router;
