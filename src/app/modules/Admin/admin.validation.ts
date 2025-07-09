import z from "zod";

const update = z.object({
    body: z.object({
        name: z.string().optional(),
        contactNumber: z.string().optional()
    }).strict() // 👈 এটি অতিরিক্ত ফিল্ড block করবে
});


export const adminValidations = {
    update
}