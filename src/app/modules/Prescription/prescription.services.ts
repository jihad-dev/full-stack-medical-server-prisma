import { log } from "console";
import {
  AppointmentStatus,
  PaymentStatus,
  Prescription,
  userRole,
} from "../../../generated/prisma";
import { prisma } from "../../../Shared/prisma";
import AppError from "../../errors/AppError";
import { IAuthUser } from "../../interfaces/common";
import { paginationHelper } from "../../../helpers/pagination";

const createPrescription = async (
  user: IAuthUser | null,
  payload: Partial<Prescription>
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload?.appointmentId,
      status: AppointmentStatus?.COMPLETED,
      paymentStatus: PaymentStatus?.PAID,
    },
    include: {
      patient: true,
      doctor: true,
    },
  });
  console.log(appointmentData);
  if (!(user?.email === appointmentData?.doctor?.email)) {
    throw new AppError(403, "This is not Your Appointment!!");
  }

  const result = await prisma.prescription.create({
    data: {
      appointmentId: appointmentData.id,
      doctorId: appointmentData.doctorId,
      patientId: appointmentData?.patientId,
      instructions: payload?.instructions as string,
      followUpDate: payload?.followUpDate || null || undefined,
    },
    include: {
      patient: true,
    },
  });
  return result;
};

const getMyPrescription = async (
  user: IAuthUser |null,
  options: any
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);

  const result = await prisma.prescription.findMany({
    where: {
      patient: {
        email: user?.email,
      },
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      doctor: true,
      patient: true,
      appointment: true,
    },
  });

  const total = await prisma.prescription.count({
    where: {
      patient: {
        email: user?.email,
      },
    },
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
export const prescriptionServices = {
  createPrescription,
  getMyPrescription,
};
