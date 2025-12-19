-- Remove skill_type check constraint to allow any skill type value
ALTER TABLE skills DROP CONSTRAINT IF EXISTS skills_skill_type_check;
