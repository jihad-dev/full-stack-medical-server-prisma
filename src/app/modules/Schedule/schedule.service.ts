import { addHours, addMinutes, format, parse } from "date-fns";
import { prisma } from "../../../Shared/prisma";
import { SchedulePayload } from "./schedule.interface";
import { Prisma, Schedule } from "../../../generated/prisma";
import { paginationHelper } from "../../../helpers/pagination";

const getAllSchedule = async (
  params:any ,
  options: any
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;
  console.log(filterData);
  
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
  const whereConditons: Prisma.ScheduleWhereInput = { AND: andCondions };

  const result = await prisma.schedule.findMany({
    where: whereConditons,
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
    where: whereConditons,
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
 getAllSchedule
};
