import express from "express";
import { adminController } from "./admin.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { adminValidations } from "./admin.validation";
const router = express.Router();

router.get('/', adminController.getAllAdmin);
router.get('/:id', adminController.getSingleDataById);
router.patch('/:id', validateRequest(adminValidations.update), adminController.updateIntoDB);
router.delete('/:id', adminController.deleteIntoDB);
router.delete('/soft/:id', adminController.softDeleteIntoDB);


export const adminRoutes = router;