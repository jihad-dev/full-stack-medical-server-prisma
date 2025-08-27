import express from "express";
import { doctorController } from "./doctor.controller";
import auth from "../../middlewares/auth";
import { userRole } from "../../../generated/prisma";

const router = express.Router();

router.get("/", doctorController.getAllDoctor);
router.get("/:id", doctorController.getSingleDoctor);
router.patch("/:id", doctorController.updateDoctorInfo);
router.delete(
  "/soft/:id",
  auth(userRole.SUPER_ADMIN, userRole.ADMIN),
  doctorController.deleteDoctor
);
router.delete(
  "/:id",
  auth(userRole.SUPER_ADMIN, userRole.ADMIN),
  doctorController.HardDeleteDoctor
);
export const doctorRoutes = router;
