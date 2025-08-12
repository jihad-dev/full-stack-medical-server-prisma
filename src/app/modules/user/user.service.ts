import {
  Admin,
  Doctor,
  Patient,
  Prisma,
  PrismaClient,
  userRole,
  userStatus,
} from "../../../generated/prisma";
import bcrypt from "bcrypt";
import { fileUploader } from "../../../helpers/fileUploader";
import { IUploadFile } from "../../interfaces/file";
import { IAdminFilterRequest, IAdminOptions } from "../Admin/admin.interface";
import { getPaginationParams } from "../../../helpers/pagination";
import { userFilterableFields, userSearchAbleFields } from "./user.constant";
import { Request } from "express";
import { IAuthUser } from "../../interfaces/common";

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

  // 🔍 Search: partial match (LIKE) for name, email, contactNumber
  const searchConditions = searchTerm
    ? userSearchAbleFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      }))
    : [];

  // ✅ Exact filters for fields like email, role, status etc.
  const exactMatchConditions = userFilterableFields
    .filter(
      (field) =>
        field !== "searchTerm" &&
        exactParams?.[field as keyof typeof exactParams]
    )
    .map((field) => {
      const value = exactParams[field as keyof typeof exactParams];

      // Prepare condition
      const condition: any = {
        equals: value,
      };
      return {
        [field]: condition,
      };
    });

  // 👇 Combined WHERE clause
  const where: Prisma.UserWhereInput = {
    ...(searchConditions.length || exactMatchConditions.length
      ? {
          AND: [
            ...exactMatchConditions,
            ...(searchConditions.length ? [{ OR: searchConditions }] : []),
          ],
        }
      : {}),
  };

  // 🗃️ Fetch users
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
    select: {
      id: true,
      email: true,
      role: true,
      needPasswordChange: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // 🧮 Count total users
  const total = await prisma.user.count({ where });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const changeProfileStatus = async (
  id: string,
  payload: { status: userStatus }
) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });
  const updateStatus = await prisma.user.update({
    where: {
      id,
    },
    data: {
      status: payload.status,
    },
  });
  return updateStatus;
};

const getMyProfile = async (user: IAuthUser) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: userStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      needPasswordChange: true,
      role: true,
      status: true,
    },
  });
  let profileInfo;
  if (userData.role === userRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: userData.email,
      },
    });
  } else if (userData.role === userRole.ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: userData.email,
      },
    });
  } else if (userData.role === userRole.DOCTOR) {
    profileInfo = await prisma.doctor.findUnique({
      where: {
        email: userData.email,
      },
    });
  } else if (userData.role === userRole.PATIENT) {
    profileInfo = await prisma.patient.findUnique({
      where: {
        email: userData.email,
      },
    });
  }
  return { ...userData, ...profileInfo };
};
const updateMyProfile = async (user: IAuthUser, req: Request) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email ,
      status: userStatus.ACTIVE,
    },
  });
  const file = req.file as IUploadFile;
  if (file) {
    const uplodedData = await fileUploader.uploadToCloudenery(file);
    req.body.profilePhoto = uplodedData?.secure_url as string;
  }
  let profileInfo;
  if (userData.role === userRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: userData.email,
      },
      data: req.body,
    });
  } else if (userData.role === userRole.ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: userData.email,
      },
      data: req.body,
    });
  } else if (userData.role === userRole.DOCTOR) {
    profileInfo = await prisma.doctor.update({
      where: {
        email: userData.email,
      },
      data: req.body,
    });
  } else if (userData.role === userRole.PATIENT) {
    profileInfo = await prisma.patient.update({
      where: {
        email: userData.email,
      },
      data: req.body,
    });
  }
  return { ...profileInfo };
};

export const userServices = {
  createAdmin,
  createDoctor,
  createPatient,
  getAllUserFromDB,
  changeProfileStatus,
  getMyProfile,
  updateMyProfile,
};
