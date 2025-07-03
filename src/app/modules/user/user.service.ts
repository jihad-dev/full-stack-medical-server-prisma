
import { PrismaClient, userRole } from "../../../generated/prisma"
import bcrypt from 'bcrypt'
const prisma = new PrismaClient();
const createAdmin = async (data: any) => {
    const hashedPassword = await bcrypt.hash(data?.password, 12);
    const userData = {
        email: data?.admin?.email,
        password: hashedPassword,
        role: userRole.ADMIN
    }
    const adminData = data?.admin;


    // use transtion and roalback

    const result = await prisma.$transaction(async (transactionClient) => {
        const createdUserData = await transactionClient?.user?.create({
            data: userData
        });
        const createdAdminData = await transactionClient?.admin?.create({
            data: adminData
        });
        return createdAdminData;
    })


    return result;
}

const createUser = async (data: any) => {
    const hashedPassword = await bcrypt.hash(data?.password, 12);

    const user = await prisma.user.create({
        data: {
            email: data?.email,
            password: hashedPassword,
            role: userRole.PATIENT,
        },
    });

    return user;
};


export const userServices = {
    createAdmin,
    createUser
}