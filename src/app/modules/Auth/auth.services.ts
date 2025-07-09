import { prisma } from "../../../Shared/prisma"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { generateToken } from "../../../helpers/generateToken"
import { decode } from "punycode"


const loginUser = async (payload: {
    email: string,
    password: string
}) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload?.email
        }
    });
    const checkingPassword = await bcrypt.compare(payload?.password, userData.password);
    if (!checkingPassword) {
        throw new Error("Invalid credentials");
    }
    // create a jwt access token

    const accessToken = generateToken(
        { email: userData.email, role: userData.role },
        process.env.JWT_SECRET as string,
        '5m'
    );

    // create a jwt refresh token
    const refreshToken = generateToken(
        { email: userData.email, role: userData.role },
        process.env.JWT_REFRESH_SECRET as string,
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
        const decoded = jwt.verify(
            token,
            process.env.JWT_REFRESH_SECRET as string
        ) as jwt.JwtPayload;

        if (!decoded?.email) {
            throw new Error('Invalid token');
        }
        // ২. ডাটাবেজ থেকে ইউজার বের করো
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                email: decoded.email,
            },
        });

        if (!user) {
            throw new Error('User not found');
        }
        // ৩. নতুন accessToken জেনারেট করো
        const newAccessToken = generateToken(
            { email: user.email, role: user.role },
            process.env.JWT_SECRET as string,
            '1h'
        );

        return {
            accessToken: newAccessToken,
            needPasswordChange: user?.needPasswordChange
        };
    } catch (error) {
        console.log(error)
    }

};

export const authServices = {
    loginUser,
    refreshToken
}