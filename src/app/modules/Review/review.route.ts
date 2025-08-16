import express from "express";
import { ReviewController } from "./review.controller";
import auth from "../../middlewares/auth";
import { userRole } from "../../../generated/prisma";
import { validateRequest } from "../../middlewares/validateRequest";
import { ReviewValidation } from "./review.validation";

const router = express.Router();

router.get("/", ReviewController.getAllFromDB);

router.post(
  "/",
  auth(userRole.PATIENT),
  validateRequest(ReviewValidation.create),
  ReviewController.insertIntoDB
);

export const ReviewRoutes = router;
