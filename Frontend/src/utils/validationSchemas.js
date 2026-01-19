import { z } from "zod";

// Book Demo Form Schema
export const bookDemoSchema = z.object({
  studentName: z
    .string()
    .min(2, "Student name must be at least 2 characters")
    .max(100, "Student name must be less than 100 characters")
    .regex(
      /^[a-zA-Z\s]+$/,
      "Student name should only contain letters and spaces",
    ),

  parentName: z
    .string()
    .min(2, "Parent name must be at least 2 characters")
    .max(100, "Parent name must be less than 100 characters")
    .regex(
      /^[a-zA-Z\s]+$/,
      "Parent name should only contain letters and spaces",
    ),

  parentEmail: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),

  country: z.string().min(1, "Country is required"),

  studentAge: z
    .number({ invalid_type_error: "Student age must be a number" })
    .min(5, "Student must be at least 5 years old")
    .max(18, "Student must be under 18 years old"),

  timezone: z.string().min(1, "Timezone is required"),

  preferred_date: z
    .string()
    .min(1, "Preferred date is required")
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, "Preferred date cannot be in the past"),

  preferred_time: z
    .string()
    .min(1, "Preferred time is required")
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time"),
});

// Login Form Schema
export const loginSchema = z.object({
  role: z.enum(["CUSTOMER", "COACH", "ADMIN"], {
    errorMap: () => ({ message: "Please select a valid role" }),
  }),

  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),

  password: z.string().min(1, "Password is required"),
});

// Payment Form Schema
export const paymentSchema = z.object({
  cardholderName: z
    .string()
    .min(2, "Cardholder name must be at least 2 characters")
    .max(100, "Cardholder name must be less than 100 characters")
    .regex(
      /^[a-zA-Z\s]+$/,
      "Cardholder name should only contain letters and spaces",
    ),

  cardNumber: z
    .string()
    .min(1, "Card number is required")
    .transform((val) => val.replace(/\s/g, "")) // Remove spaces first
    .refine(
      (val) => /^\d{13,19}$/.test(val),
      "Card number must be between 13 and 19 digits",
    ),

  expiryDate: z
    .string()
    .min(1, "Expiry date is required")
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry date must be in MM/YY format")
    .refine((date) => {
      const [month, year] = date.split("/");
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const today = new Date();
      return expiry > today;
    }, "Card has expired"),

  cvv: z
    .string()
    .min(3, "CVV must be at least 3 digits")
    .max(4, "CVV must be at most 4 digits")
    .regex(/^\d+$/, "CVV must contain only numbers"),
});

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
});

// Update Password Schema
export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
