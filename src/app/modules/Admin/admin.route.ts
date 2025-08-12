import express from "express";
import { adminController } from "./admin.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { adminValidations } from "./admin.validation";
import auth from "../../middlewares/auth";
import { userRole } from "../../../generated/prisma";
const router = express.Router();
// TODO: auth(userRole.SUPER_ADMIN, userRole.ADMIN),
router.get('/',  adminController.getAllAdmin);
router.get('/:id', auth(userRole.SUPER_ADMIN, userRole.ADMIN), adminController.getSingleDataById);
router.patch('/:id', auth(userRole.SUPER_ADMIN, userRole.ADMIN), validateRequest(adminValidations.update), adminController.updateIntoDB);
router.delete('/:id', auth(userRole.SUPER_ADMIN, userRole.ADMIN), adminController.deleteIntoDB);
router.delete('/soft/:id', auth(userRole.SUPER_ADMIN, userRole.ADMIN), adminController.softDeleteIntoDB);


export const adminRoutes = router;