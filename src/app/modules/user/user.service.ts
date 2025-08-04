import { PrismaClient, userRole } from "../../../generated/prisma";
import bcrypt from "bcrypt";
import { fileUploader } from "../../../helpers/fileUploader";
import { IUploadFile } from "../../interfaces/file";
const prisma = new PrismaClient();
const createAdmin = async (req: any) => {
  const file: IUploadFile = req?.file;
  if (file) {
    const uploadedData = await fileUploader.uploadToCloudenery(file);
    req.body.admin.profilePhoto = uploadedData?.secure_url as string;
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 12);
  const userData = {
    email: req.body?.admin?.email,
    password: hashedPassword,
    role: userRole.ADMIN,
  };
  const adminData = req.body?.admin;

  // use transtion and roalback

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient?.user?.create({
      data: userData,
    });
    const createdAdminData = await transactionClient?.admin?.create({
      data: adminData,
    });
    return createdAdminData;
  });

  return result;
};

export const userServices = {
  createAdmin,
};
