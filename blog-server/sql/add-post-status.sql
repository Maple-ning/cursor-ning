USE blog_db;

ALTER TABLE posts
  ADD COLUMN status ENUM('draft', 'published') NOT NULL DEFAULT 'draft' AFTER category;
