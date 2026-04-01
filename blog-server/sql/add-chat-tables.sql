-- 聊天室（分享码加入）与消息；在已有库上执行：mysql ... < sql/add-chat-tables.sql

CREATE TABLE IF NOT EXISTS chat_rooms (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(128) NOT NULL DEFAULT '聊天室',
  share_code VARCHAR(16) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_chat_share_code (share_code),
  INDEX idx_chat_rooms_created (created_at)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  room_id BIGINT UNSIGNED NOT NULL,
  sender_name VARCHAR(64) NOT NULL DEFAULT '匿名',
  content TEXT NULL,
  image_url VARCHAR(512) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_messages_room FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
  INDEX idx_chat_messages_room_time (room_id, id)
);
