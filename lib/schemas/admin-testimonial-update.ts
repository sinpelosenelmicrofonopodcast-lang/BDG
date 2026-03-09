import { z } from "zod";

export const adminTestimonialUpdateSchema = z.object({
  active: z.boolean(),
  isFeatured: z.boolean()
});

export type AdminTestimonialUpdateInput = z.infer<typeof adminTestimonialUpdateSchema>;
