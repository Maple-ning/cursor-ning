USE blog_db;

SET @exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'projects'
    AND COLUMN_NAME = 'source_code_url'
);

SET @sql := IF(
  @exists = 0,
  'ALTER TABLE projects ADD COLUMN source_code_url VARCHAR(500) NULL AFTER url',
  'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
