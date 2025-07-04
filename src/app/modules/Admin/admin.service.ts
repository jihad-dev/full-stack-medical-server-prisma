
import { Admin } from "../../../generated/prisma";
import { getPaginationParams } from "../../../helpers/pagination";
import { prisma } from "../../../Shared/prisma";
import { adminSearchAbleFields } from "./admin.constant";
const getAllAdminFromDB = async (params: any, options: any) => {

    const { skip, limit, sortBy, sortOrder, page } = getPaginationParams(options);
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
        .filter((field) => exactParams?.[field])
        .map((field) => ({
            [field]: {
                equals: exactParams[field],
                mode: 'insensitive',
            },
        }));

    const where =
        searchConditions.length || exactMatchConditions.length
            ? {
                AND: [
                    ...exactMatchConditions,
                    ...(searchConditions.length ? [{ OR: searchConditions }] : []),
                ],
            }
            : undefined;

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
        data: result
    }

};

const getSingleDataById = async (id: string) => {

    const result = await prisma.admin.findUnique({
        where: {
            id
        }
    })
    console.log(result)
    return result;
}

const updateIntoDB = async (id: string, data: Partial<Admin>) => {
    await prisma.admin.findUniqueOrThrow({
        where: {
            id
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
    const result = await prisma.$transaction(async (transactionClient) => {
        // Delete admin
        const adminDeletedData = await transactionClient.admin.delete({
            where: { id },
        });

        // Delete user associated with the admin's email
        await transactionClient.user.delete({
            where: { email: adminDeletedData.email },
        });

        // Return deleted admin data
        return adminDeletedData;
    });

    return result;
};

export const adminServices = {
    getAllAdminFromDB,
    getSingleDataById,
    updateIntoDB,
    deleteIntoDB
};



