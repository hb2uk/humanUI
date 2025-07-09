import { z } from 'zod';

export const languageSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(2).max(8), // e.g. 'en', 'th', 'en-US'
  name: z.string(),
  nativeName: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type Language = z.infer<typeof languageSchema>;

export const cultureSchema = z.object({
  id: z.string().optional(),
  cultureCode: z.string().min(2), // e.g. 'en-US'
  name: z.string(),
  countryCode: z.string().min(2).max(2),
  dateFormat: z.string(),
  timeFormat: z.string(),
  numberFormat: z.string(),
  currencyFormat: z.string(),
  timezoneId: z.string().optional(),
  defaultTimezone: z.string().optional(),
  isDefault: z.boolean().default(false),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  languageId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type Culture = z.infer<typeof cultureSchema>;

export const currencySchema = z.object({
  id: z.string().optional(),
  code: z.string().min(3).max(3), // e.g. 'THB', 'USD'
  name: z.string(),
  symbol: z.string(),
  decimalDigits: z.number().default(2),
  decimalSeparator: z.string().default('.'),
  thousandSeparator: z.string().default(','),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type Currency = z.infer<typeof currencySchema>;

export const translationSchema = z.object({
  id: z.string().optional(),
  languageCode: z.string().min(2),
  namespace: z.string(),
  key: z.string(),
  value: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type Translation = z.infer<typeof translationSchema>;

export const timezoneSchema = z.object({
  id: z.string().optional(),
  name: z.string(), // e.g. 'Asia/Bangkok'
  offset: z.string(), // e.g. '+07:00'
  offsetMinutes: z.number(),
  isDst: z.boolean().default(false),
  countryCode: z.string().min(2).max(2),
  region: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type Timezone = z.infer<typeof timezoneSchema>; 