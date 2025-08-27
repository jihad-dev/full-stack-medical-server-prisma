export const reviewFilterableFields: string[] = ['patientEmail', 'doctorEmail'];
export type ReviewFilter = {
  patientEmail?: string;
  doctorEmail?: string;
};
export type ReviewOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};
