import { prisma } from "../../../Shared/prisma";
import bcrypt from "bcrypt";
import { generateToken, verifyToken } from "../../../helpers/generateToken";
import { userStatus } from "../../../generated/prisma";
import config from "../../../config";
import { Secret } from "jsonwebtoken";
import emailSender from "./emailSender";

const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload?.email,
      status: userStatus.ACTIVE,
    },
  });

  const checkingPassword = await bcrypt.compare(
    payload?.password,
    userData.password
  );
  if (!checkingPassword) {
    throw new Error("Invalid credentials");
  }
  // create a jwt access token

  const accessToken = generateToken(
    { email: userData.email, role: userData.role },
    config.jwt_secret as string,
    "7d"
  );
 
  // create a jwt refresh token
  const refreshToken = generateToken(
    { email: userData.email, role: userData.role},
    config.jwt_refresh_secret as string,
    "30d"
  );
  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData?.needPasswordChange,
  };
};

const refreshToken = async (token: string) => {
  try {
    // ১. টোকেন verify করো
    const decoded = verifyToken(
      token,
      process.env.JWT_REFRESH_SECRET as string
    );

    if (!decoded?.email) {
      throw new Error("Invalid token");
    }
    // ২. ডাটাবেজ থেকে ইউজার বের করো
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        email: decoded.email,
        status: userStatus.ACTIVE,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }
    // ৩. নতুন accessToken জেনারেট করো
    const newAccessToken = generateToken(
      { email: user.email, role: user.role},
      config.jwt_secret as string,
      "8h"
    );

    return {
      accessToken: newAccessToken,
      needPasswordChange: user?.needPasswordChange,
    };
  } catch (error) {
    throw new Error("You Are Not Authorized!!");
  }
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
