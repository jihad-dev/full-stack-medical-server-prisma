/*
  Warnings:

  - A unique constraint covering the columns `[appointmentId]` on the table `DoctorSchedule` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DoctorSchedule_appointmentId_key" ON "DoctorSchedule"("appointmentId");

-- AddForeignKey
ALTER TABLE "DoctorSchedule" ADD CONSTRAINT "DoctorSchedule_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
