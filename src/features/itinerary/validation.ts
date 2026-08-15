import { z } from "zod";

const optionalTrimmed = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? v.trim() : undefined));

export const itineraryCategories = [
  "FLIGHT",
  "LODGING",
  "ACTIVITY",
  "TRANSPORT",
  "FOOD",
  "OTHER",
] as const;

export const itineraryItemFormSchema = z.object({
  date: z.coerce.date({ error: "Date is required" }),
  startTime: optionalTrimmed,
  endTime: optionalTrimmed,
  title: z.string().trim().min(1, "Title is required").max(200),
  category: z.enum(itineraryCategories),
  location: optionalTrimmed,
  notes: optionalTrimmed,
});

export type ItineraryItemFormValues = z.infer<typeof itineraryItemFormSchema>;
