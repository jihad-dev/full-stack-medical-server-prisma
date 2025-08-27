import { prisma } from "../../../Shared/prisma";
import bcrypt from "bcrypt";
import { generateToken, verifyToken } from "../../../helpers/generateToken";
import { userStatus } from "../../../generated/prisma";
import config from "../../../config";
import { Secret } from "jsonwebtoken";
import emailSender from "./emailSender";
import AppError from "../../errors/AppError";
import httpStatus from 'http-status'
const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findFirstOrThrow({
    where: {
      email: payload?.email,
      status: userStatus.ACTIVE,
    },
  });

  const checkingPassword = await bcrypt.compare(
    payload.password,
    userData.password
  );
  if (!checkingPassword) {
    throw new Error("Invalid credentials");
  }
  // create a jwt access token

  const accessToken = generateToken(
    { email: userData.email, role: userData.role },
    config.jwt_secret as string,
    "2d"
  );

  // create a jwt refresh token
  const refreshToken = generateToken(
    { email: userData.email, role: userData.role },
    config.jwt_refresh_secret as string,
    "7d"
  );
  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData?.needPasswordChange,
  };
};

const refreshToken = async (refreshToken: string) => {
  let decodedData;
  try {
    decodedData = verifyToken(refreshToken, config.jwt_refresh_secret as Secret);
  } catch (err) {
   throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized! refresh token");
  }

  const userData = await prisma.user.findFirstOrThrow({
    where: {
      email: decodedData.email,
      status: userStatus.ACTIVE,
    },
  });

  const accessToken = generateToken(
    { email: userData.email, role: userData.role },
    config.jwt_secret as string,
    "7d" as string
  );

  return {
    accessToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const changePassword = async (user: any, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: userStatus.ACTIVE,
    },
  });
  const isPasswordCorrect: boolean = await bcrypt.compare(
    payload?.oldPassword,
    userData?.password
  );
  if (!isPasswordCorrect) {
    throw new Error("Password Is Not Matched");
  }
  const hashedPassword: string = await bcrypt.hash(payload.newPassword, 12);
  await prisma.user.update({
    where: {
      email: userData?.email,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });
};
const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload?.email,
      status: userStatus.ACTIVE,
    },
  });
  const resetPassToken = generateToken(
    { email: userData.email, role: userData.role },
    config.reset_password_token as string,
    config.reset_password_expires_in as string
  );
  const resetLink =
    config.reset_password_link +
    `?userId=${userData.id}&token=${resetPassToken}`;
  await emailSender(
    userData?.email,
    `<div style="font-family: Arial, sans-serif; color: #333;">
  <p>Dear User,</p>
  <p>
    You requested to reset your password. Please click the link below to proceed:
  </p>
  <p>
    <a href=${resetLink} 
       style="color: #1a73e8; text-decoration: none;">
      Reset Your Password
    </a>
  </p>
  <p>
    If you did not request this, you can safely ignore this message.
  </p>
  <p>Best regards,<br>Ph Medical</p>
</div>
`
  );
};
const resetPassword = async (
  token: string,
  payload: { id: string; password: string }
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.id,
      status: userStatus.ACTIVE,
    },
  });
  const isTokenValid = verifyToken(
    token,
    config.reset_password_token as Secret
  );
  if (!isTokenValid) {
    throw new Error("Token Not Found!!");
  }
  const hashedPassword: string = await bcrypt.hash(payload.password, 12);
  await prisma.user.update({
    where: {
      id: userData.id,
      status: userStatus.ACTIVE,
    },
    data: {
      password: hashedPassword,
    },
  });
};
export const authServices = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
