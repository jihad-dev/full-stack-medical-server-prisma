import { Prisma } from "../../../generated/prisma";
import { paginationHelper } from "../../../helpers/pagination";

import { prisma } from "../../../Shared/prisma";
import { doctorSearchableFields } from "./doctor.constant";

// find All Doctor Info

const getAllDoctor = async (params: any, options: any) => {
  // 📌 Pagination + sorting
  const { skip, limit, sortBy, sortOrder, page } = paginationHelper.calculatePagination({
    ...options,
    sortOrder:
      options.sortOrder === "asc" || options.sortOrder === "desc"
        ? options.sortOrder
        : undefined,
  });

  const { searchTerm, specialties, ...exactParams } = params || {};
  
  // 🔍 Partial search conditions
  const searchConditions =
    searchTerm && searchTerm.trim() !== ""
      ? doctorSearchableFields.map((field: string) => ({
          [field]: {
            contains: searchTerm,
            mode: "insensitive" as const,
          },
        }))
      : [];

  // 🎯 Exact match conditions
  const exactMatchConditions = doctorSearchableFields
    .filter((field) => exactParams?.[field as keyof typeof exactParams])
    .map((field) => ({
      [field]: {
        equals: exactParams[field as keyof typeof exactParams],
        mode: "insensitive" as const,
      },
    }));

  // 🛠 Specialties filter condition
  let specialtiesCondition: Prisma.DoctorWhereInput = {};
  if (specialties && (Array.isArray(specialties) ? specialties.length : true)) {
    specialtiesCondition = {
      doctorSpecialities: {
        some: {
          specialities: {
            title: Array.isArray(specialties)
              ? {
                  in: specialties,
                  mode: "insensitive" as const,
                }
              : {
                  equals: specialties,
                  mode: "insensitive" as const,
                },
          },
        },
      },
    };
  }

  // 🛠 Final where condition
  const where: Prisma.DoctorWhereInput = {
    isDeleted: false,
    ...(searchConditions.length ||
    exactMatchConditions.length ||
    Object.keys(specialtiesCondition).length
      ? {
          AND: [
            ...exactMatchConditions,
            ...(searchConditions.length ? [{ OR: searchConditions }] : []),
            ...(Object.keys(specialtiesCondition).length
              ? [specialtiesCondition]
              : []),
          ],
        }
      : {}),
  };

  // 📥 Query with relations
  const result = await prisma.doctor.findMany({
    where,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder ? { [sortBy]: sortOrder } : { createdAt: "desc" },
    include: {
      doctorSpecialities: {
        include: {
          specialities: true,
          
        },
      },
    },
  });

  const total = await prisma.doctor.count({ where });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getSingleDoctor = async (id: string) => {
  const result = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      doctorSpecialities: {
        include: {
          specialities: true,
        },
      },
    },
  });
  return result;
};
const HardDeleteDoctor = async (id: string) => {
  const result = await prisma.$transaction(async (tx) => {
    // Step 1: Doctor info নাও (email বের করতে)
    const doctor = await tx.doctor.findUniqueOrThrow({
      where: { id },
      select: { email: true },
    });

    // Step 2: Delete related specialities
    await tx.doctorSpecialities.deleteMany({
      where: { doctorId: id },
    });

    // Step 3: Delete doctor
    await tx.doctor.delete({
      where: { id },
    });

    // Step 4: Delete user
    const userData = await tx.user.delete({
      where: { email: doctor.email },
    });

    return userData;
  });

  return result;
};

const deleteDoctor = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    // Step 1: Get doctor info for user email
    const doctor = await tx.doctor.findUniqueOrThrow({
      where: { id },
      select: { email: true },
    });

    // Step 2: Soft delete doctor (set isDeleted = true)
    await tx.doctor.update({
      where: { id },
      data: { isDeleted: true },
    });

    // Step 3: Block user
    const user = await tx.user.update({
      where: { email: doctor.email },
      data: { status: "BLOCKED" },
    });

    return user;
  });
};

const updateDoctorInfo = async (id: string, payload: any) => {
  const { specialities, ...doctorData } = payload;

  // ডাক্তার আছে কিনা চেক
  const doctorInfo = await prisma.doctor.findUnique({
    where: { id },
  });

  const result = await prisma.$transaction(async (tx) => {
    // 1️⃣ ডাক্তার তথ্য আপডেট
    const updatedDoctor = await tx.doctor.update({
      where: { id },
      data: doctorData,
    });

    // 2️⃣ পুরোনো specialities ডিলিট
    await tx.doctorSpecialities.deleteMany({
      where: { doctorId: doctorInfo?.id },
    });

    // 3️⃣ নতুন specialities ইনসার্ট
    if (specialities?.length) {
      await tx.doctorSpecialities.createMany({
        data: specialities.map((specialityId: string) => ({
          doctorId: doctorInfo?.id,
          specialitiesId: specialityId,
        })),
      });
    }

    // 4️⃣ রিটার্ন ডাক্তার + specialities
    return tx.doctor.findUnique({
      where: { id },
      include: {
        doctorSpecialities: {
          include: { specialities: true },
        },
      },
    });
  });

  return result;
};

export const doctorServices = {
  updateDoctorInfo,
  getAllDoctor,
  getSingleDoctor,
  deleteDoctor,
  HardDeleteDoctor,
};
