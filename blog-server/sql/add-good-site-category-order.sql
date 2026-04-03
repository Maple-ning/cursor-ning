USE blog_db;

CREATE TABLE IF NOT EXISTS good_site_category_order (
  category VARCHAR(100) NOT NULL PRIMARY KEY,
  sort_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT IGNORE INTO good_site_category_order (category, sort_order)
SELECT DISTINCT category, 0 FROM good_sites;
