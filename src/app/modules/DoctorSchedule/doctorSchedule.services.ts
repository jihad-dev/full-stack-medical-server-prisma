import { Prisma, userRole } from "../../../generated/prisma";
import { paginationHelper } from "../../../helpers/pagination";
import { prisma } from "../../../Shared/prisma";
import AppError from "../../errors/AppError";
import { IAuthUser } from "../../interfaces/common";

const createDoctorSchedule = async (
  user: IAuthUser | null,
  payload: { scheduleIds: string[] }
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });
  const doctorScheduleData = payload.scheduleIds?.map((scheduleId) => ({
    doctorId: doctorData?.id,
    scheduleId,
  }));
  const result = await prisma.doctorSchedule.createMany({
    data: doctorScheduleData,
  });
  return result;
};

const getMySchedule = async (
  filters: any,
  options: any,
  user: IAuthUser | null
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { startDate, endDate, ...filterData } = filters;
  const andConditions: any[] = [];

  // --------------------------
  // Role Based Access
  // --------------------------
  if (user?.role === userRole.DOCTOR) {
    // DOCTOR → শুধু নিজের স্কেডিউল
    andConditions.push({
      doctor: { email: user?.email },
    });
  } else if (
    user?.role === userRole.ADMIN ||
    user?.role === userRole.SUPER_ADMIN
  ) {
    // ADMIN/SUPER_ADMIN → সব স্কেডিউল দেখতে পারবে
  } else {
    throw new Error("You are not authorized to view schedules");
  }

  // --------------------------
  // Date filter
  // --------------------------
  if (startDate && endDate) {
    andConditions.push({
      AND: [
        { schedule: { startDateTime: { gte: startDate } } },
        { schedule: { endDateTime: { lte: endDate } } },
      ],
    });
  }

  // --------------------------
  // Other filters (isBooked etc.)
  // --------------------------
  if (Object.keys(filterData).length > 0) {
    // Convert string to boolean
    if (filterData.isBooked === "true") filterData.isBooked = true;
    if (filterData.isBooked === "false") filterData.isBooked = false;

    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  // --------------------------
  // Prisma where conditions
  // --------------------------
  const whereConditions: Prisma.DoctorScheduleWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // --------------------------
  // Fetch Data
  // --------------------------
  const result = await prisma.doctorSchedule.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { schedule: { startDateTime: "asc" } }, // default sort
    include: {
      schedule: true, // schedule details দরকার হলে
      doctor: true, // doctor details দরকার হলে
    },
  });

  const total = await prisma.doctorSchedule.count({ where: whereConditions });

  return {
    meta: { total, page, limit },
    data: result,
  };
};


const getAllDoctorSchedule = async (
    filters: any,
    options:any ,
) => {
    const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;
    const andConditions = [];

    if (searchTerm) {
        andConditions.push({
            doctor: {
                name: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            },
        });
    }

    if (Object.keys(filterData).length > 0) {
        if (typeof filterData.isBooked === 'string' && filterData.isBooked === 'true') {
            filterData.isBooked = true;
        } else if (typeof filterData.isBooked === 'string' && filterData.isBooked === 'false') {
            filterData.isBooked = false;
        }
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: (filterData as any)[key]
                }
            }))
        });
    }

    const whereConditions: any =
        andConditions.length > 0 ? { AND: andConditions } : {};
    const result = await prisma.doctorSchedule.findMany({
        include: {
            doctor: true,
            schedule: true,
        },
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : {},
    });
    const total = await prisma.doctorSchedule.count({
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


const deleteDoctorSchedule = async (scheduleId: string, user: IAuthUser) => {
  return await prisma.$transaction(async (tx) => {
    // ডাক্তার ডেটা বের করা
    const doctorData = await tx.doctor.findUniqueOrThrow({
      where: {
        email: user?.email,
      },
    });

    // শিডিউল বের করা
    const doctorSchedule = await tx.doctorSchedule.findUnique({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId,
        },
      },
    });

    // বুকড থাকলে ডিলিট বন্ধ
    if (doctorSchedule?.isBooked) {
      throw new AppError(400, "You cannot delete this schedule because it is already booked");
    }

    // ডিলিট করা
    const result = await tx.doctorSchedule.delete({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId,
        },
      },
    });

    return result;
  });
};


export const doctorScheduleServices = {
  createDoctorSchedule,
  getMySchedule,
  deleteDoctorSchedule,
  getAllDoctorSchedule
};
