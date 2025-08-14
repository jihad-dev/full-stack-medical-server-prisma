import z from "zod";

// Payload validation schema
export const appointmentSchema = z.object({
  doctorId: z.string().uuid(),
  scheduleId: z.string().uuid(),
});