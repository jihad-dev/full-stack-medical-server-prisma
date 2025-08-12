import express from "express";
import { doctorController } from "./doctor.controller";

const router = express.Router();

router.get("/", doctorController.getAllDoctor);
router.get("/:id", doctorController.getAllDoctor);
router.patch("/:id", doctorController.updateDoctorInfo);
router.delete("/soft/:id", doctorController.deleteDoctor);
router.delete("/:id", doctorController.HardDeleteDoctor);
export const doctorRoutes = router;
