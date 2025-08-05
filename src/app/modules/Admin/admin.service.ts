
import { Admin, Prisma, userStatus } from "../../../generated/prisma";
import { getPaginationParams } from "../../../helpers/pagination";
import { prisma } from "../../../Shared/prisma";
import { adminSearchAbleFields } from "./admin.constant";
import { IAdminFilterRequest, IAdminOptions } from "./admin.interface";

const getAllAdminFromDB = async (params: IAdminFilterRequest, options: IAdminOptions) => {

    const { skip, limit, sortBy, sortOrder, page } = getPaginationParams({
        ...options,
        sortOrder: options.sortOrder === 'asc' || options.sortOrder === 'desc' ? options.sortOrder : undefined
    });
    const { searchTerm, ...exactParams } = params || {};
    // 🔍 Partial match using searchTerm
    const searchConditions = searchTerm
        ? adminSearchAbleFields.map((field) => ({
            [field]: {
                contains: searchTerm,
                mode: 'insensitive',
            },
        }))
        : [];

    // ✅ Exact match using query like ?email=...&name=...
    const exactMatchConditions = adminSearchAbleFields
        .filter((field) => exactParams?.[field as keyof typeof exactParams])
        .map((field) => ({
            [field]: {
                equals: exactParams[field as keyof typeof exactParams],
                mode: 'insensitive',
            },
        }));

    const where = {
        isDeleted: false, // 👈 include only not-deleted
        ...(searchConditions.length || exactMatchConditions.length
            ? {
                AND: [
                    ...exactMatchConditions,
                    ...(searchConditions.length ? [{ OR: searchConditions }] : []),
                ],
            }
            : {}),
    };

    const result = await prisma.admin.findMany({
        where,
        skip,
        take: limit,
        orderBy: sortBy && sortOrder ? {
            [sortBy]: sortOrder
        } : {
            createdAt: 'desc'
        }

    });
    const total = await prisma.admin.count({ where });
    return {
        meta: { page, limit, total },
        data: result,
        
    }

};

const getSingleDataById = async (id: string) => {

    const result = await prisma.admin.findUnique({
        where: {
            id,
            isDeleted: false
        }
    })
    return result;
}

const updateIntoDB = async (id: string, data: Partial<Admin>) => {
    await prisma.admin.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false
        }
    })
    const result = await prisma.admin.update({
        where: {
            id
        },
        data
    });
    return result;
}


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
            if (error.code === 'P2025') {

                throw new Error(' user not found.');
            }

        }


        throw new Error(error?.message || 'Something went wrong while deleting admin.');
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
                    isDeleted: true
                }
            });

            // Delete associated user based on admin's email
            await tx.user.update({
                where: { email: adminDeletedData.email },
                data: {
                    status: userStatus.DELETED
                }
            });
            return adminDeletedData;
        });

        return result;

    } catch (error: any) {
        // Handle known Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                // Record not found
                throw new Error(' user not found.');
            }
            // Add other error code handlers if necessary
        }

        // Re-throw unknown errors
        throw new Error(error?.message || 'Something went wrong while deleting admin.');
    }
};



export const adminServices = {
    getAllAdminFromDB,
    getSingleDataById,
    updateIntoDB,
    deleteIntoDB,
    softDeleteIntoDB
};



