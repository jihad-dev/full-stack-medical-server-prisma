import { addHours, addMinutes, format, parse } from "date-fns";
import { prisma } from "../../../Shared/prisma";
import { SchedulePayload } from "./schedule.interface";
import { Schedule } from "../../../generated/prisma";

// const getSinglePatient = async (id: string) => {
//   const result = await prisma.patient.findUniqueOrThrow({
//     where: {
//       id,
//     },
//     include: {
//       patientHealthData: true,
//       medicalReport: true,
//     },
//   });
//   return result;
// };
// const HardDeletePatient = async (id: string) => {
//   const result = await prisma.$transaction(async (tx) => {
//     // Step 1: patient info
//     const patient = await tx.patient.findUniqueOrThrow({
//       where: { id },
//     });
//     // Step 2: Delete  medicalReport
//     await tx.medicalReport.deleteMany({
//       where: { patientId: id },
//     });
//     // Step 3: Delete patientHealthData
//     await tx.patientHealthData.deleteMany({
//       where: { patientId: id },
//     });

//     // Step 4: Delete patient
//     await tx.patient.delete({
//       where: { id },
//     });

//     // Step 5: Delete user
//     const patientData = await tx.user.delete({
//       where: { email: patient.email },
//     });

//     return patientData;
//   });

//   return result;
// };

// const SoftdeletePatient = async (id: string): Promise<Patient | null> => {
//   return await prisma.$transaction(async (tx) => {
//     const patient = await tx.patient.findUniqueOrThrow({
//       where: { id },
//     });

//     await tx.patient.update({
//       where: { id },
//       data: { isDeleted: true },
//     });

//     await tx.user.update({
//       where: { email: patient.email },
//       data: { status: userStatus.BLOCKED },
//     });

//     return tx.patient.findUnique({ where: { id } });
//   });
// };

// const updatePatientInfo = async (
//   id: string,
//   payload: Partial<IPatientUpdate>
// ): Promise<Patient | null> => {
//   const { patientHealthData, medicalReport, ...patientData } = payload;

//   try {
//     // 1️⃣ Check if patient exists
//     const patientInfo = await prisma.patient.findUniqueOrThrow({
//       where: {
//         id,
//         isDeleted: false,
//       },
//     });

//     // 2️⃣ Transaction
//     const result = await prisma.$transaction(async (tx) => {
//       // 2.1 Update patient main data
//       await tx.patient.update({
//         where: { id },
//         data: patientData,
//       });

//       // 2.2 Create or update patient health data
//       if (patientHealthData) {
//         await tx.patientHealthData.upsert({
//           where: { patientId: id },
//           create: {
//             patientId: id,
//             ...patientHealthData,
//           },
//           update: patientHealthData,
//         });
//       }

//       // 2.3 Create medical report (optional)
//       if (medicalReport) {
//         await tx.medicalReport.create({
//           data: { ...medicalReport, patientId: id },
//         });
//       }

//       // 2.4 Return updated patient with relations (use tx)
//       return await tx.patient.findUnique({
//         where: { id: patientInfo.id },
//         include: {
//           patientHealthData: true,
//           medicalReport: true,
//         },
//       });
//     });

//     // ✅ Return the transaction result
//     return result;
//   } catch (error: any) {
//     if (error.code === "P2025") {
//       throw new AppError(404, "Patient not found");
//     }
//     throw error;
//   }
// };
const createSchedule = async (
  payload: SchedulePayload
): Promise<Schedule[]> => {
  const { startDate, endDate, startTime, endTime } = payload;
  let currentDate = new Date(startDate);
  const lastDate = new Date(endDate);
  const intervalTime = 30;
  const schedules = [];

  while (currentDate <= lastDate) {
    let startDateTime = addMinutes(
      addHours(
        new Date(format(currentDate, "yyyy-MM-dd")),
        Number(startTime.split(":")[0])
      ),
      Number(startTime.split(":")[1])
    );
    const endDateTime = addMinutes(
      addHours(
        new Date(format(currentDate, "yyyy-MM-dd")),
        Number(endTime.split(":")[0])
      ),
      Number(endTime.split(":")[1])
    );

    while (startDateTime < endDateTime) {
      const scheduleData = {
        startDateTime: new Date(startDateTime), // কপি
        endDateTime: addMinutes(new Date(startDateTime), intervalTime), // + 30
      };
      // insert schedule Data inTo DB

      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          startDateTime: scheduleData.startDateTime,
          endDateTime: scheduleData.endDateTime,
        },
      });
      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });
        schedules.push(result);
      }

      startDateTime = addMinutes(startDateTime, intervalTime);
    }

    currentDate.setDate(currentDate.getDate() + 1); // পরের দিনে যাওয়া
  }

  return schedules;
};
export const scheduleServices = {
  createSchedule,
  //   getAllPatient,
  //   getSinglePatient,
  //   updatePatientInfo,
  //   SoftdeletePatient,
  //   HardDeletePatient,
};
