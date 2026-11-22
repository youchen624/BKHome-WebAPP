-- 1. 聊天室主表
CREATE TABLE IF NOT EXISTS chat_rooms (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    type VARCHAR(16) NOT NULL CHECK (type IN ('direct', 'group')), -- 私訊或群組
    name VARCHAR(100), -- 私訊時可為 NULL，由前端動態顯示對方名稱
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- 用於聊天室列表排序
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 聊天室成員與已讀狀態表
CREATE TABLE IF NOT EXISTS chat_room_members (
    room_id BIGINT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(16) NOT NULL DEFAULT 'member', -- 'owner' | 'admin' | 'member'
    last_read_message_id BIGINT, -- 記錄該成員讀到的最新訊息 ID，用來算未讀數
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (room_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON chat_room_members(user_id);



-- 3. 訊息主表（永遠保存最新狀態）
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    room_id BIGINT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id BIGINT REFERENCES users(id) ON DELETE SET NULL, -- 帳號刪除後保留訊息並顯示「已刪除使用者」
    reply_to_id BIGINT REFERENCES chat_messages(id) ON DELETE SET NULL, -- 回覆特定訊息
    
    msg_type VARCHAR(16) NOT NULL DEFAULT 'text', -- 'text' | 'image' | 'file' | 'system'
    content TEXT NOT NULL,                        -- 純文字內容或檔案說明
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,  -- 彈性欄位：存檔案 URL、尺寸、MIME、系統事件參數
    
    edited_at TIMESTAMPTZ,                        -- NULL 代表未編輯過
    deleted_at TIMESTAMPTZ,                       -- 軟刪除：收回訊息時填入時間，保留「此訊息已收回」佔位
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 最關鍵的複合索引：專為「某聊天室往回滑動載入歷史訊息」設計
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_cursor 
ON chat_messages (room_id, id DESC);

-- 4. 訊息編輯歷史備份表
CREATE TABLE IF NOT EXISTS chat_message_edits (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    previous_content TEXT NOT NULL,
    edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chat_message_edits_msg_id ON chat_message_edits(message_id);



-- -- 第一次進入聊天室：抓最新 50 則
-- SELECT * FROM chat_messages 
-- WHERE room_id = $1 
-- ORDER BY id DESC LIMIT 50;

-- -- 往上滑動載入更舊的訊息（帶入畫面上最舊那則訊息的 id，例如 1042）：
-- SELECT * FROM chat_messages 
-- WHERE room_id = $1 AND id < $2 
-- ORDER BY id DESC LIMIT 50;



-- {
--   "file_uuid": "a1b2c3d4-...",
--   "filename": "architecture.png",
--   "mime_type": "image/png",
--   "size_bytes": 245810,
--   "width": 1920,
--   "height": 1080
-- }


