import config from "../src/config";
import { userRole, userStatus } from "../src/generated/prisma";
import { prisma } from "../src/Shared/prisma";
import bcrypt from "bcrypt";

const seedSuperAdmin = async () => {
  try {
    // check if super admin exists
    const isExistsSuperAdmin = await prisma.user.findFirst({
      where: {
        role: userRole.SUPER_ADMIN,
        status: userStatus.ACTIVE,
      },
    });

    if (isExistsSuperAdmin) {
      console.log("✅ Super admin already exists:", isExistsSuperAdmin.email);
      return;
    }

    // hash password
    const hashedPassword = await bcrypt.hash(
      config.super_admin_password as string,
      10
    );

    // create super admin
    const superAdmin = await prisma.user.create({
      data: {
        email: config?.super_admin_email as string,
        password: hashedPassword,
        role: userRole.SUPER_ADMIN,
        status: userStatus.ACTIVE,
        admin: {
          create: {
            name: "Jihadul Islam",
            contactNumber: "01611889746",
            profilePhoto: null,
          },
        },
      },
    });

    console.log("🎉 Super admin created successfully:", superAdmin.email);
  } catch (error) {
    console.error("❌ Error seeding super admin:", error);
  } finally {
    await prisma.$disconnect();
  }
};

// run the seeder
seedSuperAdmin();
