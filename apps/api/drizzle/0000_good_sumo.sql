CREATE TABLE "chat_message_edits" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "chat_message_edits_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"message_id" bigint NOT NULL,
	"previous_content" text NOT NULL,
	"edited_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "chat_messages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"room_id" bigint NOT NULL,
	"sender_id" bigint,
	"reply_to_id" bigint,
	"msg_type" varchar(16) DEFAULT 'text' NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_silent" boolean DEFAULT false NOT NULL,
	"is_spoiler" boolean DEFAULT false NOT NULL,
	"edited_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chat_messages_uuid_key" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "chat_room_members" (
	"room_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"role" varchar(16) DEFAULT 'member' NOT NULL,
	"last_read_message_id" bigint,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"left_at" timestamp with time zone,
	"rejoined_at" timestamp with time zone,
	CONSTRAINT "chat_room_members_pkey" PRIMARY KEY("room_id","user_id"),
	CONSTRAINT "active_state" CHECK ((left_at IS NULL) OR (rejoined_at IS NULL))
);
--> statement-breakpoint
CREATE TABLE "chat_rooms" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "chat_rooms_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(16) NOT NULL,
	"direct_key" text,
	"name" varchar(128),
	"created_by" bigint,
	"last_message_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "chat_rooms_uuid_key" UNIQUE("uuid"),
	CONSTRAINT "chat_rooms_direct_key_key" UNIQUE("direct_key"),
	CONSTRAINT "chat_rooms_type_check" CHECK ((type)::text = ANY ((ARRAY['direct'::character varying, 'group'::character varying])::text[])),
	CONSTRAINT "chat_rooms_check" CHECK (((type)::text <> 'direct'::text) OR (direct_key IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "invitations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"token" text NOT NULL,
	"owner_id" bigint NOT NULL,
	"used_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_token_key" UNIQUE("token"),
	CONSTRAINT "invitations_token_check" CHECK (length(token) >= 16)
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" bigint NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_uuid_key" UNIQUE("uuid"),
	CONSTRAINT "sessions_token_hash_key" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"username" varchar(64) NOT NULL,
	"display_name" text NOT NULL,
	"password_hash" text NOT NULL,
	"inviter_id" bigint,
	"invitation_id" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_uuid_key" UNIQUE("uuid"),
	CONSTRAINT "users_invitation_id_key" UNIQUE("invitation_id"),
	CONSTRAINT "users_email_check" CHECK ((length(email) >= 5) AND (length(email) <= 512)),
	CONSTRAINT "users_display_name_check" CHECK ((length(display_name) >= 1) AND (length(display_name) <= 64)),
	CONSTRAINT "users_root_cannot_be_deleted" CHECK ((inviter_id IS NOT NULL) OR (deleted_at IS NULL)),
	CONSTRAINT "users_invitation_consistency" CHECK (((inviter_id IS NULL) AND (invitation_id IS NULL)) OR ((inviter_id IS NOT NULL) AND (invitation_id IS NOT NULL)))
);
--> statement-breakpoint
ALTER TABLE "chat_message_edits" ADD CONSTRAINT "chat_message_edits_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_reply_to_id_chat_messages_id_fk" FOREIGN KEY ("reply_to_id") REFERENCES "public"."chat_messages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "public"."chat_messages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_room_members" ADD CONSTRAINT "chat_room_members_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_room_members" ADD CONSTRAINT "chat_room_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_room_members" ADD CONSTRAINT "fk_chat_room_members_last_read_message_id" FOREIGN KEY ("last_read_message_id") REFERENCES "public"."chat_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "fk_users_invitation_id" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_chat_message_edits_msg_id" ON "chat_message_edits" USING btree ("message_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_chat_messages_room_cursor" ON "chat_messages" USING btree ("room_id" int8_ops,"id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_chat_members_room_active" ON "chat_room_members" USING btree ("room_id" int8_ops) WHERE (left_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_chat_members_user_active" ON "chat_room_members" USING btree ("user_id" int8_ops) WHERE (left_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_invitations_owner_id" ON "invitations" USING btree ("owner_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_sessions_expires_at" ON "sessions" USING btree ("expires_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_sessions_user_id" ON "sessions" USING btree ("user_id" int8_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "users_active_email_unique" ON "users" USING btree (lower(email)) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE UNIQUE INDEX "users_active_username_unique" ON "users" USING btree (lower((username)::text)) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE UNIQUE INDEX "users_one_root_user_only" ON "users" USING btree ((1)) WHERE (inviter_id IS NULL);