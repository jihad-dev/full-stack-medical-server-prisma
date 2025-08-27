
import { prisma } from "../../../Shared/prisma";
import { SchedulePayload } from "./schedule.interface";
import { Prisma, Schedule } from "../../../generated/prisma";
import { paginationHelper } from "../../../helpers/pagination";
import { IAuthUser } from "../../interfaces/common";
import { IScheduleFilterRequest, IScheduleOptions } from "./schedule.constant";
import { addMinutes, addHours, format, } from "date-fns";


const convertDateTime = async (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + offset);
}
const getAllSchedule = async (
  params: IScheduleFilterRequest,
  options: IScheduleOptions,
  user: IAuthUser | null
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { startDate, endDate, ...filterData } = params;

  const andCondions: Prisma.ScheduleWhereInput[] = [];
  // Exact Match
  if (Object.keys(filterData).length > 0) {
    andCondions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }
  // Date and Time Filtering
  if (startDate && endDate) {
    andCondions.push({
      AND: [
        {
          startDateTime: {
            gte: startDate,
          },
        },
        {
          endDateTime: {
            lte: endDate,
          },
        },
      ],
    });
  }

  // doctor add schedule remove get all schedule

  const doctorSchedules = await prisma.doctorSchedule.findMany({
    where: {
      doctor: {
        email: user?.email,
      },
    },
  });
  const doctorScheduleIds = doctorSchedules?.map(
    (schedule) => schedule.scheduleId
  );
  const whereConditons: Prisma.ScheduleWhereInput = { AND: andCondions };
  const result = await prisma.schedule.findMany({
    where: {
      ...whereConditons,
      id: {
        notIn: doctorScheduleIds,
      },
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
  });

  const total = await prisma.schedule.count({
    where: {
      ...whereConditons,
      id: {
        notIn: doctorScheduleIds,
      },
    },
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const createSchedule = async (payload: SchedulePayload): Promise<Schedule[]> => {
    const { startDate, endDate, startTime, endTime } = payload;

    const interverlTime = 30;

    const schedules = [];

    const currentDate = new Date(startDate); // start date
    const lastDate = new Date(endDate) // end date

    while (currentDate <= lastDate) {
        // 09:30  ---> ['09', '30']
        const startDateTime = new Date(
            addMinutes(
                addHours(
                    `${format(currentDate, 'yyyy-MM-dd')}`,
                    Number(startTime.split(':')[0])
                ),
                Number(startTime.split(':')[1])
            )
        );

        const endDateTime = new Date(
            addMinutes(
                addHours(
                    `${format(currentDate, 'yyyy-MM-dd')}`,
                    Number(endTime.split(':')[0])
                ),
                Number(endTime.split(':')[1])
            )
        );

        while (startDateTime < endDateTime) {
         
            const s = await convertDateTime(startDateTime);
            const e = await convertDateTime(addMinutes(startDateTime, interverlTime))

            const scheduleData = {
                startDateTime: s,
                endDateTime: e
            }

            const existingSchedule = await prisma.schedule.findFirst({
                where: {
                    startDateTime: scheduleData.startDateTime,
                    endDateTime: scheduleData.endDateTime
                }
            });

            if (!existingSchedule) {
                const result = await prisma.schedule.create({
                    data: scheduleData
                });
                schedules.push(result);
            }

            startDateTime.setMinutes(startDateTime.getMinutes() + interverlTime);
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return schedules;
};



const getSingleschedule = async (id: string): Promise<Schedule | null> => {
  const result = await prisma.schedule.findUniqueOrThrow({
    where: {
      id,
    },
  });
  return result;
};

const deleteSchedule = async (id: string): Promise<Schedule> => {
  const result = await prisma.schedule.delete({
    where: {
      id,
    },
  });
  console.log({ result });

  return result;
};
export const scheduleServices = {
  createSchedule,
  getAllSchedule,
  getSingleschedule,
  deleteSchedule,
};
