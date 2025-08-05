import {
  Admin,
  Doctor,
  Patient,
  PrismaClient,
  userRole,
} from "../../../generated/prisma";
import bcrypt from "bcrypt";
import { fileUploader } from "../../../helpers/fileUploader";
import { IUploadFile } from "../../interfaces/file";
import { IAdminFilterRequest, IAdminOptions } from "../Admin/admin.interface";
import { getPaginationParams } from "../../../helpers/pagination";
import { userSearchAbleFields } from "./user.constant";
import { Request } from "express";
import { promise } from "zod";
const prisma = new PrismaClient();
const createAdmin = async (req: Request): Promise<Admin> => {
  const file = req?.file as IUploadFile;
  if (file) {
    const uploadedData = await fileUploader.uploadToCloudenery(file);
    req.body.admin.profilePhoto = uploadedData?.secure_url as string;
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 12);
  const userData = {
    email: req.body.admin.email,
    password: hashedPassword,
    role: userRole.ADMIN,
  };
  const adminData = req.body?.admin;

  // use transtion and roalback

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient?.user?.create({
      data: userData,
    });
    const createdAdminData = await transactionClient?.admin?.create({
      data: adminData,
    });
    return createdAdminData;
  });

  return result;
};
const createDoctor = async (req: Request): Promise<Doctor> => {
  const file = req?.file as IUploadFile;
  if (file) {
    const uploadedData = await fileUploader.uploadToCloudenery(file);
    req.body.doctor.profilePhoto = uploadedData?.secure_url as string;
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 12);
  const userData = {
    email: req.body.doctor.email,
    password: hashedPassword,
    role: userRole.DOCTOR,
  };
  const doctorData = req.body?.doctor;

  // use transtion and roalback

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient?.user?.create({
      data: userData,
    });
    const createdDoctorData = await transactionClient?.doctor?.create({
      data: doctorData,
    });
    return createdDoctorData;
  });

  return result;
};
const createPatient = async (req: Request): Promise<Patient> => {
  const file = req?.file as IUploadFile;
  if (file) {
    const uploadedData = await fileUploader.uploadToCloudenery(file);
    req.body.patient.profilePhoto = uploadedData?.secure_url as string;
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 12);
  const userData = {
    email: req.body.patient.email,
    password: hashedPassword,
    role: userRole.PATIENT,
  };
  const patientData = req.body?.patient;

  // use transtion and roalback

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient?.user?.create({
      data: userData,
    });
    const createdPatientData = await transactionClient?.patient?.create({
      data: patientData,
    });
    return createdPatientData;
  });

  return result;
};
const getAllUserFromDB = async (
  params: IAdminFilterRequest,
  options: IAdminOptions
) => {
  const { skip, limit, sortBy, sortOrder, page } = getPaginationParams({
    ...options,
    sortOrder:
      options.sortOrder === "asc" || options.sortOrder === "desc"
        ? options.sortOrder
        : undefined,
  });
  const { searchTerm, ...exactParams } = params || {};
  // 🔍 Partial match using searchTerm
  const searchConditions = searchTerm
    ? userSearchAbleFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      }))
    : [];

  // ✅ Exact match using query like ?email=...&name=...
  const exactMatchConditions = userSearchAbleFields
    .filter((field) => exactParams?.[field as keyof typeof exactParams])
    .map((field) => ({
      [field]: {
        equals: exactParams[field as keyof typeof exactParams],
        mode: "insensitive",
      },
    }));

  const where = {
    // isDeleted: false, // 👈 include only not-deleted
    ...(searchConditions.length || exactMatchConditions.length
      ? {
          AND: [
            ...exactMatchConditions,
            ...(searchConditions.length ? [{ OR: searchConditions }] : []),
          ],
        }
      : {}),
  };

  const result = await prisma.user.findMany({
    where,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? {
            [sortBy]: sortOrder,
          }
        : {
            createdAt: "desc",
          },
  });
  const total = await prisma.user.count({ where });
  return {
    meta: { page, limit, total },
    data: result,
  };
};
export const userServices = {
  createAdmin,
  createDoctor,
  createPatient,
  getAllUserFromDB,
};
