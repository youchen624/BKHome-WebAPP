-- init.sql will be executed only once
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  email TEXT NOT NULL CHECK (length(email) BETWEEN 5 AND 512),
  username VARCHAR(64) NOT NULL,
  display_name TEXT NOT NULL CHECK (length(display_name) BETWEEN 1 AND 50),
  password_hash TEXT NOT NULL,
  -- role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'admin' | 'user'
  inviter_id BIGINT REFERENCES users(id),
  invitation_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,  -- NULL as NONE

  -- 1. 防止 Root 使用者被軟刪除
  CONSTRAINT users_root_cannot_be_deleted
    CHECK (inviter_id IS NOT NULL OR deleted_at IS NULL),

  -- 2. 確保一般使用者註冊時，邀請人與邀請紀錄必須成對存在
  CONSTRAINT users_invitation_consistency
    CHECK (
      (inviter_id IS NULL AND invitation_id IS NULL) OR
      (inviter_id IS NOT NULL AND invitation_id IS NOT NULL)
    )
);

CREATE UNIQUE INDEX users_one_root_user_only
ON users ((1))
WHERE inviter_id IS NULL;

CREATE UNIQUE INDEX users_active_username_unique
ON users (LOWER(username))
WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX users_active_email_unique
ON users (LOWER(email))
WHERE deleted_at IS NULL;


CREATE TABLE IF NOT EXISTS sessions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL, -- SHA-256 hash
  -- user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);


CREATE TABLE IF NOT EXISTS invitations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  token TEXT UNIQUE NOT NULL CHECK (length(token) >= 16), -- 補上了 >= 運算子
  owner_id BIGINT REFERENCES users(id) ON DELETE RESTRICT,
  invitee_id BIGINT REFERENCES users(id) ON DELETE RESTRICT,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 查詢某個使用者發出的所有邀請時會用到
CREATE INDEX IF NOT EXISTS idx_invitations_owner_id ON invitations(owner_id);


-- 解決循環參照：等 invitations 建好後，再把 users.invitation_id 的外鍵綁上去
ALTER TABLE users
ADD CONSTRAINT fk_users_invitation
FOREIGN KEY (invitation_id) REFERENCES invitations(id);
