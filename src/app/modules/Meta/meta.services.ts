
import { PaymentStatus, userRole } from "../../../generated/prisma";
import { prisma } from "../../../Shared/prisma";
import { IAuthUser } from "../../interfaces/common";

const fetchDashboardMetaData = async (user: IAuthUser | null) => {
  let metaData;
  switch (user?.role) {
    case userRole.SUPER_ADMIN:
      metaData = await getSuperAdminMetaData();
      break;
    case userRole.ADMIN:
      metaData = await getAdminMetaData();
      break;
    case userRole.DOCTOR:
      metaData = await getDoctorMetaData(user);
      break;
    case userRole.PATIENT:
      metaData = await getPatientMetaData(user);
      break;

    default:
      throw new Error("Invalid User Role!!");
  }
  return metaData;
};

const getSuperAdminMetaData = async () => {
  const doctorCount = await prisma.doctor.count();
  const patientCount = await prisma.patient.count();
  const adminCount = await prisma.admin.count();
  const appointmentCount = await prisma.appointment.count();
  const paymentCount = await prisma.payment.count();

  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: PaymentStatus.PAID,
    },
  });
  const barChartData = await getAppointmentsByMonth();
  const pieChartData = await getPieChartData();

  return {
    doctorCount,
    patientCount,
    appointmentCount,
    totalRevenue: totalRevenue._sum.amount || 0,
    paymentCount,
    adminCount,
    barChartData,
    pieChartData
  };
};

const getAdminMetaData = async () => {
  const doctorCount = await prisma.doctor.count();
  const patientCount = await prisma.patient.count();
  const appointmentCount = await prisma.appointment.count();
  const paymentCount = await prisma.payment.count();

  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: PaymentStatus.PAID,
    },
  });
const barChartData = await getAppointmentsByMonth();
  const pieChartData = await getPieChartData();
  return {
    doctorCount,
    patientCount,
    appointmentCount,
    totalRevenue: totalRevenue._sum.amount || 0,
    paymentCount,
    barChartData,
    pieChartData
  };
};

const getDoctorMetaData = async (user: IAuthUser | null) => {
  // doctor identify
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  // appointment count
  const appointmentCount = await prisma.appointment.count({
    where: {
      doctorId: doctorData.id,
    },
  });

  // unique patient count
  const patientCount = await prisma.appointment.groupBy({
    by: ["patientId"],
    where: {
      doctorId: doctorData.id,
    },
  });

  // total revenue (doctor এর সকল appointment এর payment sum)
  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: PaymentStatus.PAID,
      appointment: {
        doctorId: doctorData.id,
      },
    },
  });

  // review count (doctor কে কতগুলো review দেওয়া হয়েছে)
  const reviewCount = await prisma.review.count({
    where: {
      doctorId: doctorData.id,
    },
  });

  // appointment status distribution
  const appointmentStatusDistrubution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
    where: {
      doctorId: doctorData.id,
    },
  });

  const formattedAppointmentStatusDistrubution =
    appointmentStatusDistrubution.map((count) => ({
      status: count.status,
      count: Number(count._count.id),
    }));

  return {
    appointmentCount,
    patientCount: patientCount.length,
    totalRevenue: totalRevenue._sum.amount || 0,
    reviewCount,
    appointmentStatusDistrubution: formattedAppointmentStatusDistrubution,
  };
};

const getPatientMetaData = async (user: IAuthUser | null) => {
  // patient identify
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  // appointment count
  const appointmentCount = await prisma.appointment.count({
    where: {
      patientId: patientData.id,
    },
  });

  //  patient prescription count
  const patientPrescriptionCount = await prisma.prescription.count({
    where: {
      patientId: patientData.id,
    },
  });

  // review count (patient কতগুলো review দিয়েছে)
  const reviewCount = await prisma.review.count({
    where: {
      patientId: patientData.id,
    },
  });

  const appointmentStatusDistrubution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
    where: {
      patientId: patientData.id,
    },
  });

  const formattedAppointmentStatusDistrubution =
    appointmentStatusDistrubution.map((count) => ({
      status: count.status,
      count: Number(count._count.id),
    }));

  return {
    appointmentCount,
    patientPrescriptionCount,
    reviewCount,
    appointmentStatus: formattedAppointmentStatusDistrubution,
  };
};


// --->  COMPLEX PART IN THIS PROJECT --->

 const getAppointmentsByMonth = async () => {
  const appointments = await prisma.appointment.findMany({
    select: { createdAt: true },
  });

  const monthCount: Record<string, number> = {};

  appointments.forEach(app => {
    const month = app.createdAt.toISOString().slice(0, 7); // YYYY-MM
    monthCount[month] = (monthCount[month] || 0) + 1;
  });

  const chartData = Object.entries(monthCount)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => (a.month > b.month ? 1 : -1));

  return chartData;
};

const getPieChartData = async () => {
    const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ['status'],
        _count: { id: true }
    });

    const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map(({ status, _count }) => ({
        status,
        count: Number(_count.id)
    }));

    return formattedAppointmentStatusDistribution;
}

export const metaServices = {
  fetchDashboardMetaData,
};
