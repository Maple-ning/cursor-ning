USE blog_db;

SET @exists_tagline := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'profile'
    AND COLUMN_NAME = 'tagline'
);

SET @sql_tagline := IF(
  @exists_tagline = 0,
  'ALTER TABLE profile ADD COLUMN tagline VARCHAR(255) NULL AFTER name',
  'SELECT 1'
);

PREPARE stmt_tagline FROM @sql_tagline;
EXECUTE stmt_tagline;
DEALLOCATE PREPARE stmt_tagline;

SET @exists_focus_points := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'profile'
    AND COLUMN_NAME = 'focus_points'
);

SET @sql_focus_points := IF(
  @exists_focus_points = 0,
  'ALTER TABLE profile ADD COLUMN focus_points JSON NULL AFTER intro',
  'SELECT 1'
);

PREPARE stmt_focus_points FROM @sql_focus_points;
EXECUTE stmt_focus_points;
DEALLOCATE PREPARE stmt_focus_points;
