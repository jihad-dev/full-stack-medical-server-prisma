export const scheduleFilterableFields = ['startDate','endDate'];

export interface IScheduleFilterRequest {
  startDate?: string;
  endDate?: string;

}

export interface IScheduleOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
