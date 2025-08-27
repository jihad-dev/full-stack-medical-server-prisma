import express from "express";
import auth from "../../middlewares/auth";
import { userRole } from "../../../generated/prisma";
import { metaController } from "./meta.controller";

const router = express.Router();

router.get(
  "/",
  auth(userRole.SUPER_ADMIN, userRole.ADMIN, userRole.DOCTOR, userRole.PATIENT),
  metaController.fetchDashboardMetaData
);

export const metaRoutes = router;
