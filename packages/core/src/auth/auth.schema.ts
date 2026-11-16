// packages/core/src/auth/auth.schema.ts
import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.email("email invalid").max(255),
  username: z
    .string()
    .min(6, "Username need at least 6 characters")
    .max(32, "Username supports at most 32 characters only")
    .regex(
      /^[a-z_][a-z0-9_-]+$/,
      "Username only supports lowercase letters, numbers, underscores, and dashes, and must start with a letter or underscore",
    ),
  display_name: z.string().min(1, "Display name is required").max(64),
  password: z.string().min(8, "Password need at least 8 characters").max(128),
  invitation_token: z.uuid(),
});

export const LoginSchema = z.object({
  email: z.email("Valid email format is required"),
  password: z.string().min(1, "Please enter the password"),
});

export const PublicUserSchema = z.object({
  uuid: z.uuid(),
  email: z.email(),
  username: z.string(),
  display_name: z.string(),
  // role: z.enum(["admin", "user"]),
  is_root: z.boolean(),
  createdAt: z.string(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type PublicUser = z.infer<typeof PublicUserSchema>;
