import express from "express";
import { userController } from "./user.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post('/', auth('ADMIN'), userController.createAdmin);
router.post('/create-user', userController.createUser);

export const userRoutes = router;