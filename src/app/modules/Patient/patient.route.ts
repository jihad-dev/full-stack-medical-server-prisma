import express from "express";
import { patientController } from "./patient.controller";

const router = express.Router();

router.get("/", patientController.getAllPatient);
router.get("/:id", patientController.getSinglePatient);
router.patch("/:id", patientController.updatePatientInfo);
router.delete("/soft/:id", patientController.SoftDeletePatient);
router.delete("/:id", patientController.HardDeletePatient);
export const patientRoutes = router;
