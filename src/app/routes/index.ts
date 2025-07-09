import express from "express";
import { userRoutes } from "../modules/user/user.route";
import { adminRoutes } from "../modules/Admin/admin.route";
import { authRoutes } from "../modules/Auth/auth.route";

const router = express.Router();

const moduleRoutes = [
    {
        path: '/user',
        route: userRoutes
    },
    {
        path: '/admin',
        route: adminRoutes
    },
    {
        path: '/auth',
        route: authRoutes
    },
]

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;