import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().min(1, "שם מלא הוא שדה חובה"),
  phone: z.string().min(1, "טלפון הוא שדה חובה"),
  email: z
    .string()
    .email("אימייל לא תקין")
    .optional()
    .or(z.literal("")),
  legalArea: z.string().min(1, "תחום משפטי הוא שדה חובה"),
  priority: z.string().min(1, "עדיפות היא שדה חובה"),
  budget: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().nonnegative().optional()
  ),
  notes: z.string().optional(),
});

export type LeadFormValues = z.infer<typeof leadSchema>;
