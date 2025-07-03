import { PrismaClient } from "../../../generated/prisma";
import { adminSearchAbleFields } from "./admin.constant";

const prisma = new PrismaClient();

const getAllAdminFromDB = async (params: any, options: any) => {
    const page = Number(options.page || 1);
    const limit = Number(options.limit || 10);

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

    return await prisma.admin.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit

    });
};

export const adminServices = {
    getAllAdminFromDB,
};



