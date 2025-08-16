import express from "express";
import auth from "../../middlewares/auth";
import { userRole } from "../../../generated/prisma";
import { prescriptionController } from "./prescription.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { PrescriptionValidation } from "./prescription.validation";

const router = express.Router();

router.post("/", auth(userRole.DOCTOR),  validateRequest(PrescriptionValidation.create), prescriptionController.createPrescription)
router.get("/my-prescription", auth(userRole.PATIENT), prescriptionController.getMyPrescription)

export const prescriptionRoutes = router;
