export const config = {
  isDevelopment: import.meta.env.VITE_APP_ENV === "development",
  isEditingEnabled: import.meta.env.VITE_APP_EDITING_ENABLED === "true",
} as const;
