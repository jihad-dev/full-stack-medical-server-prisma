import express, { NextFunction, Request, Response } from "express";
import { fileUploader } from "../../../helpers/fileUploader";
import { specialitiesController } from "./specialities.controller";
import { specialitiesValidation } from "./specialities.validation";
import auth from "../../middlewares/auth";
import { userRole } from "../../../generated/prisma";
const router = express.Router();

router.post(
  "/",
  fileUploader.upload.single("file"),
  auth(userRole.SUPER_ADMIN, userRole.ADMIN, userRole.DOCTOR),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = specialitiesValidation.create.parse(JSON.parse(req.body.data));
    return specialitiesController.createSpecialities(req, res, next);
  }
);
router.get(
  "/",
  specialitiesController.getAllSpecialities
);
router.delete(
  "/:id",
  auth(userRole.SUPER_ADMIN, userRole.ADMIN, userRole.DOCTOR),
  specialitiesController.deleteSpecialities
);
export const specialitiesRoutes = router;
