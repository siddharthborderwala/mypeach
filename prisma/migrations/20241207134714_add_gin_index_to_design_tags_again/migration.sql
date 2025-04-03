-- Create a migration file named: add_gin_index_to_design_tags
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop indexes if they exist
DROP INDEX IF EXISTS design_tags_gin_idx;
DROP INDEX IF EXISTS design_name_idx;
DROP INDEX IF EXISTS design_created_at_idx;

-- Create the GIN index for the tags array
CREATE INDEX design_tags_gin_idx ON "Design" USING gin (tags array_ops);

-- Create index for name search
CREATE INDEX design_name_idx ON "Design" USING gin (name gin_trgm_ops);

-- Create index for created_at
CREATE INDEX design_created_at_idx ON "Design" ("createdAt" DESC);