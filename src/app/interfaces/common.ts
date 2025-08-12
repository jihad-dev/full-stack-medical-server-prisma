
import { userRole } from "../../generated/prisma";

export type IAuthUser = {
  email: string; // ✅ lowercase 'string'
  role: userRole;
} | null;
