-- Migration 007: Enforce case-insensitive user email uniqueness
-- If this migration fails, resolve duplicate rows where LOWER(email) matches first.

UPDATE users
SET email = LOWER(TRIM(email))
WHERE email <> LOWER(TRIM(email));

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower_unique
    ON users (LOWER(email));
