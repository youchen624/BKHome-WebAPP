-- init.sql will be executed only once
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  email TEXT NOT NULL CHECK (length(email) BETWEEN 5 AND 512),
  username VARCHAR(64) NOT NULL,
  display_name TEXT NOT NULL CHECK (length(display_name) BETWEEN 1 AND 64),
  password_hash TEXT NOT NULL,
  -- role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'admin' | 'user'
  inviter_id BIGINT REFERENCES users(id),
  invitation_id BIGINT UNIQUE,  -- REFERENCES invitations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,  -- NULL as NONE

  CONSTRAINT users_root_cannot_be_deleted
    CHECK (inviter_id IS NOT NULL OR deleted_at IS NULL),

  CONSTRAINT users_invitation_consistency
    CHECK (   -- root / normal user
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
  token TEXT UNIQUE NOT NULL CHECK (length(token) >= 16),
  owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- invitee_id BIGINT REFERENCES users(id) ON DELETE RESTRICT,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_invitations_owner_id ON invitations(owner_id);

-- star_invitations

ALTER TABLE users
ADD CONSTRAINT fk_users_invitation_id
FOREIGN KEY (invitation_id) REFERENCES invitations(id);




CREATE TABLE IF NOT EXISTS chat_rooms (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  type VARCHAR(16) NOT NULL CHECK (type IN ('direct', 'group')),
  direct_key TEXT UNIQUE CHECK (type <> 'direct' OR direct_key IS NOT NULL),
  name VARCHAR(128),
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS chat_room_members (
  room_id BIGINT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(16) NOT NULL DEFAULT 'member', -- 'owner' | 'admin' | 'member'
  last_read_message_id BIGINT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  rejoined_at TIMESTAMPTZ,
  -- left_at, rejoined_at EXCLUSIVE
  PRIMARY KEY (room_id, user_id),
  CONSTRAINT active_state
    CHECK(left_at IS NULL OR rejoined_at IS NULL)
);
CREATE INDEX IF NOT EXISTS idx_chat_members_user_active ON chat_room_members(user_id)
WHERE left_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_chat_members_room_active ON chat_room_members(room_id)
WHERE left_at IS NULL;

CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  room_id BIGINT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  reply_to_id BIGINT REFERENCES chat_messages(id) ON DELETE SET NULL,

  msg_type VARCHAR(16) NOT NULL DEFAULT 'text', -- 'text' | 'image' | 'file'
  content TEXT NOT NULL,                        -- raw
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,  -- metadata

  is_silent BOOLEAN NOT NULL DEFAULT FALSE,
  is_spoiler BOOLEAN NOT NULL DEFAULT FALSE,

  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_cursor
ON chat_messages (room_id, id DESC);
ALTER TABLE chat_room_members
ADD CONSTRAINT fk_chat_room_members_last_read_message_id
FOREIGN KEY (last_read_message_id) REFERENCES chat_messages(id);

CREATE TABLE IF NOT EXISTS chat_message_edits (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  message_id BIGINT NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  previous_content TEXT NOT NULL,
  edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chat_message_edits_msg_id ON chat_message_edits(message_id);

-- chat_message_pins ();
