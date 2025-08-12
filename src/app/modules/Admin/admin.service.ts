import { Admin, Prisma, userStatus } from "../../../generated/prisma";
import { paginationHelper } from "../../../helpers/pagination";
import { prisma } from "../../../Shared/prisma";
import { adminSearchAbleFields } from "./admin.constant";
import { IAdminFilterRequest, IAdminOptions } from "./admin.interface";

const getAllAdminFromDB = async (
  params: IAdminFilterRequest,
  options: IAdminOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;
  const andCondions: Prisma.AdminWhereInput[] = [];
  if (params.searchTerm) {
    andCondions.push({
      OR: adminSearchAbleFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }
  // Exact Match
  if (Object.keys(filterData).length > 0) {
    andCondions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  andCondions.push({
    isDeleted: false,
  });
  const whereConditons: Prisma.AdminWhereInput = { AND: andCondions };

  const result = await prisma.admin.findMany({
    where: whereConditons,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
  });

  const total = await prisma.admin.count({
    where: whereConditons,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleDataById = async (id: string) => {
  const result = await prisma.admin.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });
  return result;
};

const updateIntoDB = async (id: string, data: Partial<Admin>) => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });
  const result = await prisma.admin.update({
    where: {
      id,
    },
    data,
  });
  return result;
};

const deleteIntoDB = async (id: string) => {
  try {
    await prisma.admin.findUniqueOrThrow({
      where: { id },
    });

    const result = await prisma.$transaction(async (tx) => {
      const adminDeletedData = await tx.admin.delete({
        where: { id },
      });

      await tx.user.delete({
        where: { email: adminDeletedData.email },
      });

      return adminDeletedData;
    });

    return result;
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error(" user not found.");
      }
    }

    throw new Error(
      error?.message || "Something went wrong while deleting admin."
    );
  }
};
const softDeleteIntoDB = async (id: string) => {
  try {
    await prisma.admin.findUniqueOrThrow({
      where: { id, isDeleted: false },
    });
    const result = await prisma.$transaction(async (tx) => {
      // Delete admin
      const adminDeletedData = await tx.admin.update({
        where: { id },
        data: {
          isDeleted: true,
        },
      });

      // Delete associated user based on admin's email
      await tx.user.update({
        where: { email: adminDeletedData.email },
        data: {
          status: userStatus.DELETED,
        },
      });
      return adminDeletedData;
    });

    return result;
  } catch (error: any) {
    // Handle known Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        // Record not found
        throw new Error(" user not found.");
      }
      // Add other error code handlers if necessary
    }

    // Re-throw unknown errors
    throw new Error(
      error?.message || "Something went wrong while deleting admin."
    );
  }
};

export const adminServices = {
  getAllAdminFromDB,
  getSingleDataById,
  updateIntoDB,
  deleteIntoDB,
  softDeleteIntoDB,
};
