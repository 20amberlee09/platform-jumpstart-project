-- Add step_key column to user_progress for better data organization
ALTER TABLE user_progress ADD COLUMN step_key TEXT;