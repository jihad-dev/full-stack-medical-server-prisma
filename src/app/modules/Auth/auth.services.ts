import { prisma } from "../../../Shared/prisma"
import bcrypt from 'bcrypt'
import { generateToken, verifyToken } from "../../../helpers/generateToken"
import { userStatus } from "../../../generated/prisma"
import config from "../../../config"


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

export const authServices = {
    loginUser,
    refreshToken
}