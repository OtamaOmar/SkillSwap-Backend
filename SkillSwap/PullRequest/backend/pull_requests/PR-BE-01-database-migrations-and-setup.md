# PR: Database migrations + bootstrap setup (PostgreSQL)

## Summary
Adds/updates the SQL migrations that define the SkillSwap data model and provides a simple bootstrap runner for local/dev environments.

## Key changes
- Adds migration files for core tables: profiles, posts, comments, likes, shares, skills, friendships, messages, notifications.
- Provides a runnable migration script to initialize/update the database schema.
- Documents required env variables for DB connection (DATABASE_URL or DB_HOST/DB_USER/DB_PASSWORD/DB_NAME).

## Files / areas touched
- `migrations/001_init.sql`
- `migrations/002_add_password_to_profiles.sql`
- `migrations/003_align_ids_to_uuid.sql`
- `migrations/004_create_skills.sql`
- `migrations/004_friendships_connections.sql`
- `migrations/005_messaging_chat.sql`
- `migrations/006_add_missing_features.sql`
- `migrations/007_fix_friendships_updated_at.sql`
- `migrations/008_add_profile_fields.sql`
- `migrations/009_remove_skill_type_constraint.sql`
- `migrations/010_add_profile_images.sql`
- `migrations.js`
- `db.js`

## How to test (local)
1. Create `.env` with DB credentials (see `README.md`).
2. Run `npm install`.
3. Run `npm run migrate` (or `npm run migrate:and:start`) and verify tables exist in PostgreSQL.

## Notes / assumptions
This PR focuses on schema + bootstrap only; API behavior is covered in subsequent PRs.

## Suggested reviewers
- Backend: Fady Ragaie
- Backend: Mohamed Bassel
