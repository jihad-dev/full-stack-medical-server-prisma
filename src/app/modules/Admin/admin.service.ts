

import { PrismaClient } from "../../../generated/prisma";

const prisma = new PrismaClient();

const getAllAdminFromDB = async (params: any) => {
  const searchTerm = params?.searchTerm;
  const searchableFields = ['name', 'email','contactNumber'];

  const where = searchTerm
    ? {
        OR: searchableFields.map((field) => ({
          [field]: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        })),
      }
    : undefined;

  const result = await prisma.admin.findMany({ where });
  return result;
};

export const adminServices = {
  getAllAdminFromDB,
};
