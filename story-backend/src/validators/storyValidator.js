import { z } from 'zod';

export const storyIdSchema = z.object({
    storyId: z.string().min(1, "Story ID is required"),
});