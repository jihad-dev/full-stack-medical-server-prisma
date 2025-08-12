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
export const doctorScheduleServices = {
  createDoctorSchedule,
};
