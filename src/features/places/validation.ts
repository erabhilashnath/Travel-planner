import { z } from "zod";

const optionalTrimmed = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? v.trim() : undefined));

export const placeFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  formattedAddress: optionalTrimmed,
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  notes: optionalTrimmed,
});

export type PlaceFormValues = z.infer<typeof placeFormSchema>;
