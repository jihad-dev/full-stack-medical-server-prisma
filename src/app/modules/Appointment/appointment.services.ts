import { prisma } from "../../../Shared/prisma";
import { IAuthUser } from "../../interfaces/common";
import { v4 as uuidv4 } from "uuid";
import { appointmentSchema } from "./appointment.validation";
import { paginationHelper } from "../../../helpers/pagination";
import {
  AppointmentStatus,
  PaymentStatus,
  Prisma,
  userRole,
} from "../../../generated/prisma";
import AppError from "../../errors/AppError";

const createAppointment = async (user: IAuthUser | null, payload: any) => {
  if (!user?.email) throw new Error("User not authenticated");

  // Validate payload
  const validatedPayload = appointmentSchema.parse(payload);

  return await prisma.$transaction(async (tx) => {
    // Fetch patient
    const patientData = await tx.patient.findUniqueOrThrow({
      where: { email: user.email },
    });

    // Fetch doctor
    const doctorData = await tx.doctor.findUniqueOrThrow({
      where: { id: validatedPayload.doctorId },
    });

    // Check if schedule is available
    const scheduleData = await tx.doctorSchedule.findFirstOrThrow({
      where: {
        doctorId: doctorData.id,
        scheduleId: validatedPayload.scheduleId,
        isBooked: false,
      },
    });

    const videoCallingId = uuidv4();

    // Create appointment
    const appointment = await tx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: scheduleData.scheduleId,
        videoCallingId,
      },
      include: {
        patient: true,
        doctor: true,
        schedule: true,
      },
    });

    // Mark schedule as booked
    await tx.doctorSchedule.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: scheduleData.scheduleId,
        },
      },
      data: {
        isBooked: true,
        appointmentId: appointment?.id,
      },
    });
    // Payment Create
    const transactionId = new Date()
      .toISOString()
      .slice(0, 16)
      .replace("T", "-")
      .replace(":", "-");
    // উদাহরণ: 2025-08-20-10-30
    await tx.payment.create({
      data: {
        appointmentId: appointment.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });

    return appointment;
  });
};

const getMyAppointment = async (
  user: IAuthUser,
  filters: any,
  options: any
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { ...filterData } = filters;

  const andConditions: Prisma.AppointmentWhereInput[] = [];

  if (user?.role === userRole.PATIENT) {
    andConditions.push({
      patient: {
        email: user?.email,
      },
    });
  } else if (user?.role === userRole.DOCTOR) {
    andConditions.push({
      doctor: {
        email: user?.email,
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

  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.appointment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include:
      user?.role === userRole.PATIENT
        ? { doctor: true, schedule: true }
        : {
            patient: {
              include: { medicalReport: true, patientHealthData: true },
            },
            schedule: true,
          },
  });

  const total = await prisma.appointment.count({
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
const getAllAppointment = async (filters: any, options: any) => {
  // pagination সেট করা
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { ...filterData } = filters;

  const andConditions: Prisma.AppointmentWhereInput[] = [];

  // ফিল্টার থাকলে সেট করা
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));
    andConditions.push(...filterConditions);
  }

  // where condition তৈরি
  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // ডাটাবেস থেকে ডেটা নেয়া
  const result = await prisma.appointment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      doctor: true,
      patient: true,
      schedule: true,
    },
  });

  // মোট সংখ্যা নেওয়া
  const total = await prisma.appointment.count({
    where: whereConditions,
  });

  // রেসপন্স রিটার্ন করা
  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const changeAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus,
  user: IAuthUser
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
    },
    include: {
      doctor: true,
    },
  });

  if (user?.role === userRole.DOCTOR) {
    if (!(user.email === appointmentData.doctor.email)) {
      throw new AppError(403, "This is not your appointment!");
    }
  }

  const result = await prisma.appointment.update({
    where: {
      id: appointmentId,
    },
    data: {
      status,
    },
  });

  // TODO4️⃣ যদি status PAID হয় → email পাঠাও
  
  return result;
};

const cancelUnpaidAppointments = async () => {
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

  const unPaidAppointments = await prisma.appointment.findMany({
    where: {
      createdAt: {
        lte: thirtyMinAgo,
      },
      paymentStatus: PaymentStatus.UNPAID,
    },
  });

  const appointmentIdsToCancel = unPaidAppointments.map(
    (appointment) => appointment.id
  );

  await prisma.$transaction(async (tx) => {
    await tx.payment.deleteMany({
      where: {
        appointmentId: {
          in: appointmentIdsToCancel,
        },
      },
    });

    await tx.appointment.deleteMany({
      where: {
        id: {
          in: appointmentIdsToCancel,
        },
      },
    });

    for (const upPaidAppointment of unPaidAppointments) {
      await tx.doctorSchedule.updateMany({
        where: {
          doctorId: upPaidAppointment.doctorId,
          scheduleId: upPaidAppointment.scheduleId,
        },
        data: {
          isBooked: false,
        },
      });
    }
  });

  //console.log("updated")
};

export const appointmentServices = {
  createAppointment,
  getMyAppointment,
  getAllAppointment,
  changeAppointmentStatus,
  cancelUnpaidAppointments,
};
