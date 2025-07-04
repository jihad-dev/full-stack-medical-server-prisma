import express from "express";
import { adminController } from "./admin.controller";

const router = express.Router();

router.get('/', adminController.getAllAdmin);
router.get('/:id', adminController.getSingleDataById);
router.patch('/:id', adminController.updateIntoDB);
router.delete('/:id', adminController.deleteIntoDB);


export const adminRoutes = router;