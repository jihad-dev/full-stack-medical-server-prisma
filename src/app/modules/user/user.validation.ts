import z from "zod";

const createAdmin = z.object({
  password: z.string({
    required_error: "password is Required!",
  }),
  admin: z.object({
    name: z.string({
      required_error: "name is requires!",
    }),
    email: z.string({
      required_error: "email is requires!",
    }),
    contactNumber: z.string({
      required_error: "contactNumber is requires!",
    }),
  }),
});
const createDoctor = z.object({
  password: z.string({
    required_error: "Password is required!",
  }),

  doctor: z.object({
    name: z.string({
      required_error: "Name is required!",
    }),
    email: z
      .string({
        required_error: "Email is required!",
      })
      .email("Invalid email format"),
    contactNumber: z.string({
      required_error: "Contact number is required!",
    }),
    address: z.string({
      required_error: "Address is required!",
    }),
    registrationNumber: z.string({
      required_error: "Registration number is required!",
    }),
    exprience: z
      .number()
      .int("Experience must be an integer")
      .nonnegative()
      .default(0),
    gender: z.enum(["MALE", "FEMALE"], {
      required_error: "Gender is required!",
    }),
    appointmentFee: z
      .number({
        required_error: "Appointment fee is required!",
      })
      .int("Fee must be an integer")
      .nonnegative(),
    qualification: z.string({
      required_error: "Qualification is required!",
    }),
    currentWorkingPlace: z.string({
      required_error: "Current working place is required!",
    }),
    designation: z.string({
      required_error: "Designation is required!",
    }),
  }),
});
const createPatient = z.object({
  password: z.string({
    required_error: "Password is required!",
  }),

  patient: z.object({
    name: z.string({
      required_error: "Name is required!",
    }),
    email: z
      .string({
        required_error: "Email is required!",
      })
      .email("Invalid email format"),
    age: z
      .number({
        required_error: "Age is required!",
      })
      .int("Age must be an integer")
      .nonnegative("Age cannot be negative"),
    contactNumber: z.string({
      required_error: "Contact number is required!",
    }),
    address: z.string({
      required_error: "Address is required!",
    }),
  }),
});
export const userValidation = {
  createAdmin,
  createDoctor,
  createPatient
};
