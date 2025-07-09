export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://humanui:humanui_password@localhost:5432/humanui_dev',
  PORT: process.env.PORT || 3000,
  API_PORT: process.env.API_PORT || 3001,
} as const; 