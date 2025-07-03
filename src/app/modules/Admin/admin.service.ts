
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

export const adminServices = {
    getAllAdminFromDB,
};



