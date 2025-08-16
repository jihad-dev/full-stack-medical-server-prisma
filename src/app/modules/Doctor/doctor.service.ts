import { Prisma } from "../../../generated/prisma";
import { paginationHelper } from "../../../helpers/pagination";
import { prisma } from "../../../Shared/prisma";
import { doctorSearchableFields } from "./doctor.constant";
// find All Doctor Info
const getAllDoctor = async (
  filters: any,
  options: any
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, specialties, ...filterData } = filters;

  const andConditions: Prisma.DoctorWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: doctorSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // doctor > doctorSpecialties > specialties -> title

  if (specialties && specialties.length > 0) {
    andConditions.push({
      doctorSpecialities: {
        some: {
          specialities: {
            title: {
              contains: specialties,
              mode: "insensitive",
            },
          },
        },
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));
    andConditions.push(...filterConditions);
  }

  andConditions.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.DoctorWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.doctor.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      doctorSpecialities: {
        include: {
          specialities: true,
        },
      },
      review: {
        select: {
          rating: true,
        },
      },
    },
  });

  const total = await prisma.doctor.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
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
