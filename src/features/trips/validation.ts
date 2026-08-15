import { z } from "zod";

import { currencyCodes } from "@/features/trips/currencies";

const optionalPositiveNumber = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? Number(v) : undefined))
  .refine((v) => v === undefined || (Number.isFinite(v) && v > 0), {
    message: "Budget must be a positive number",
  });

export const tripFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100),
    destination: z.string().trim().min(1, "Destination is required").max(100),
    startDate: z.coerce.date({ error: "Start date is required" }),
    endDate: z.coerce.date({ error: "End date is required" }),
    homeCurrency: z.enum(currencyCodes, { error: "Select a currency" }),
    budgetAmount: optionalPositiveNumber,
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export type TripFormValues = z.infer<typeof tripFormSchema>;
