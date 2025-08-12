import { Request } from "express";
import { IUploadFile } from "../../interfaces/file";
import { fileUploader } from "../../../helpers/fileUploader";
import { prisma } from "../../../Shared/prisma";

const insertIntoDB = async (req: Request) => {
  const file = req?.file as IUploadFile;
  if (file) {
    const uploadToCloudenery = await fileUploader.uploadToCloudenery(file);
    req.body.icon = uploadToCloudenery?.secure_url as string;
  }

  const result = await prisma.specialities.create({
    data: req.body,
  });
  return result;
};

const getAllSpecilities = async () => {
  const result = await prisma.specialities.findMany();
  return result;
};

const deleteSpecilities = async (id: string) => {
  const speciality = await prisma.specialities.findUnique({
    where: { id },
  });

  if (!speciality) {
    throw new Error("Speciality not found");
  }

  return prisma.specialities.delete({
    where: { id },
  });
};

export const SpecialitiesServices = {
  insertIntoDB,
  getAllSpecilities,
  deleteSpecilities,
};
