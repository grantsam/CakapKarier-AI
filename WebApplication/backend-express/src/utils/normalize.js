export const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

export const normalizeOptionalText = (value) => {
  if (value === null || value === undefined) return value;
  return String(value).trim();
};
