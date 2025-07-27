import { prisma } from "../../../Shared/prisma"
import bcrypt from 'bcrypt'
import { generateToken, verifyToken } from "../../../helpers/generateToken"
import { userStatus } from "../../../generated/prisma"
import config from "../../../config"
import { emit } from "process"
import { Secret } from "jsonwebtoken"


const loginUser = async (payload: {
    email: string,
    password: string
}) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload?.email,
            status: userStatus.ACTIVE
        }
    });
    const checkingPassword = await bcrypt.compare(payload?.password, userData.password);
    if (!checkingPassword) {
        throw new Error("Invalid credentials");
    }
    // create a jwt access token

    const accessToken = generateToken(
        { email: userData.email, role: userData.role },
        config.jwt_secret as string,
        '7d'
    );

    // create a jwt refresh token
    const refreshToken = generateToken(
        { email: userData.email, role: userData.role },
        config.jwt_refresh_secret as string,
        '30d'
    );
    return {
        accessToken,
        refreshToken,
        needPasswordChange: userData?.needPasswordChange
    };
}


export const refreshToken = async (token: string) => {
    try {

        // ১. টোকেন verify করো
        const decoded = verifyToken(token, process.env.JWT_REFRESH_SECRET as string);

        if (!decoded?.email) {
            throw new Error('Invalid token');
        }
        // ২. ডাটাবেজ থেকে ইউজার বের করো
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                email: decoded.email,
                status: userStatus.ACTIVE
            },
        });

        if (!user) {
            throw new Error('User not found');
        }
        // ৩. নতুন accessToken জেনারেট করো
        const newAccessToken = generateToken(
            { email: user.email, role: user.role },
            config.jwt_secret as string,
            '8h'
        );

        return {
            accessToken: newAccessToken,
            needPasswordChange: user?.needPasswordChange
        };
    } catch (error) {
        throw new Error('You Are Not Authorized!!')
    }

};
const changePassword = async (user: any, payload: any) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: user?.email,
            status: userStatus.ACTIVE
        }
    })
    const isPasswordCorrect: boolean = await bcrypt.compare(payload?.oldPassword, userData?.password);
    if (!isPasswordCorrect) {
        throw new Error('Password Is Not Matched')
    }
    const hashedPassword: string = await bcrypt.hash(payload.newPassword, 12);
    await prisma.user.update({
        where: {
            email: userData?.email,

        },
        data: {
            password: hashedPassword,
            needPasswordChange: false
        }
    })

}
const forgotPassword = async (payload: { email: string }) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload?.email,
            status: userStatus.ACTIVE
        }
    });
    const resetToken = generateToken({ email: userData.email, role: userData.role }, config.reset_password_token as Secret, config.reset_password_expires_in as string);
    console.log(resetToken)
}
export const authServices = {
    loginUser,
    refreshToken,
    changePassword,
    forgotPassword
}