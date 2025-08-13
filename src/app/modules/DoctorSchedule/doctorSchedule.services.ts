import { Prisma, userRole } from "../../../generated/prisma";
import { paginationHelper } from "../../../helpers/pagination";
import { prisma } from "../../../Shared/prisma";
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
      doctor:{email:user?.email}
    });
    
  } else if (user?.role === userRole.ADMIN|| user?.role === userRole.SUPER_ADMIN) {
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

export const doctorScheduleServices = {
  createDoctorSchedule,
  getMySchedule,
};
