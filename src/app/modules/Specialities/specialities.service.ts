import { Request } from "express";
import { IUploadFile } from "../../interfaces/file";
import { fileUploader } from "../../../helpers/fileUploader";
import { prisma } from "../../../Shared/prisma";
import { paginationHelper } from "../../../helpers/pagination";

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

const getAllSpecilities = async (params: any, options: any) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { title } = params;

  const andConditions: any[] = [];

  if (title) {
    andConditions.push({
      title: {
        contains: title,
        mode: "insensitive",
      },
    });
  }


  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.specialities.findMany({
    where: whereConditions,
    skip,
    take: limit,
  
  });

  const total = await prisma.specialities.count({ where: whereConditions });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
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
