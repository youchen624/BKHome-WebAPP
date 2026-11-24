import { pgTable, type AnyPgColumn, uniqueIndex, foreignKey, unique, check, bigint, uuid, text, varchar, timestamp, index, jsonb, boolean, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "users_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	uuid: uuid().defaultRandom().notNull(),
	email: text().notNull(),
	username: varchar({ length: 64 }).notNull(),
	displayName: text("display_name").notNull(),
	passwordHash: text("password_hash").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	inviterId: bigint("inviter_id", { mode: "number" }).references((): AnyPgColumn => users.id),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	invitationId: bigint("invitation_id", { mode: "number" }).references((): AnyPgColumn => invitations.id),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	uniqueIndex("users_active_email_unique").using("btree", sql`lower(email)`).where(sql`(deleted_at IS NULL)`),
	uniqueIndex("users_active_username_unique").using("btree", sql`lower((username)::text)`).where(sql`(deleted_at IS NULL)`),
	uniqueIndex("users_one_root_user_only").using("btree", sql`(1)`).where(sql`(inviter_id IS NULL)`),
	foreignKey({
			columns: [table.inviterId],
			foreignColumns: [table.id],
			name: "users_inviter_id_fkey"
		}),
	foreignKey({
			columns: [table.invitationId],
			foreignColumns: [invitations.id],
			name: "fk_users_invitation_id"
		}),
	unique("users_uuid_key").on(table.uuid),
	unique("users_invitation_id_key").on(table.invitationId),
	check("users_email_check", sql`(length(email) >= 5) AND (length(email) <= 512)`),
	check("users_display_name_check", sql`(length(display_name) >= 1) AND (length(display_name) <= 64)`),
	check("users_root_cannot_be_deleted", sql`(inviter_id IS NOT NULL) OR (deleted_at IS NULL)`),
	check("users_invitation_consistency", sql`((inviter_id IS NULL) AND (invitation_id IS NULL)) OR ((inviter_id IS NOT NULL) AND (invitation_id IS NOT NULL))`),
]);

export const sessions = pgTable("sessions", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "sessions_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	uuid: uuid().defaultRandom().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	tokenHash: text("token_hash").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_sessions_expires_at").using("btree", table.expiresAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_sessions_user_id").using("btree", table.userId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_user_id_fkey"
		}).onDelete("cascade"),
	unique("sessions_uuid_key").on(table.uuid),
	unique("sessions_token_hash_key").on(table.tokenHash),
]);

export const chatRooms = pgTable("chat_rooms", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "chat_rooms_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	uuid: uuid().defaultRandom().notNull(),
	type: varchar({ length: 16 }).notNull(),
	directKey: text("direct_key"),
	name: varchar({ length: 128 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	createdBy: bigint("created_by", { mode: "number" }),
	lastMessageAt: timestamp("last_message_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "chat_rooms_created_by_fkey"
		}).onDelete("set null"),
	unique("chat_rooms_uuid_key").on(table.uuid),
	unique("chat_rooms_direct_key_key").on(table.directKey),
	check("chat_rooms_type_check", sql`(type)::text = ANY ((ARRAY['direct'::character varying, 'group'::character varying])::text[])`),
	check("chat_rooms_check", sql`((type)::text <> 'direct'::text) OR (direct_key IS NOT NULL)`),
]);

export const invitations = pgTable("invitations", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "invitations_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	token: text().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	ownerId: bigint("owner_id", { mode: "number" }).notNull(),
	usedAt: timestamp("used_at", { withTimezone: true, mode: 'string' }),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	revokedAt: timestamp("revoked_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_invitations_owner_id").using("btree", table.ownerId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "invitations_owner_id_fkey"
		}).onDelete("restrict"),
	unique("invitations_token_key").on(table.token),
	check("invitations_token_check", sql`length(token) >= 16`),
]);

export const chatMessages = pgTable("chat_messages", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "chat_messages_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	uuid: uuid().defaultRandom().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	roomId: bigint("room_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	senderId: bigint("sender_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	replyToId: bigint("reply_to_id", { mode: "number" }).references((): AnyPgColumn => chatMessages.id, { onDelete: "set null" }),
	msgType: varchar("msg_type", { length: 16 }).default('text').notNull(),
	content: text().notNull(),
	metadata: jsonb().default({}).notNull(),
	isSilent: boolean("is_silent").default(false).notNull(),
	isSpoiler: boolean("is_spoiler").default(false).notNull(),
	editedAt: timestamp("edited_at", { withTimezone: true, mode: 'string' }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_chat_messages_room_cursor").using("btree", table.roomId.asc().nullsLast().op("int8_ops"), table.id.desc().nullsFirst().op("int8_ops")),
	foreignKey({
			columns: [table.roomId],
			foreignColumns: [chatRooms.id],
			name: "chat_messages_room_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "chat_messages_sender_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.replyToId],
			foreignColumns: [table.id],
			name: "chat_messages_reply_to_id_fkey"
		}).onDelete("set null"),
	unique("chat_messages_uuid_key").on(table.uuid),
]);

export const chatMessageEdits = pgTable("chat_message_edits", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "chat_message_edits_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	messageId: bigint("message_id", { mode: "number" }).notNull(),
	previousContent: text("previous_content").notNull(),
	editedAt: timestamp("edited_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_chat_message_edits_msg_id").using("btree", table.messageId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [chatMessages.id],
			name: "chat_message_edits_message_id_fkey"
		}).onDelete("cascade"),
]);

export const chatRoomMembers = pgTable("chat_room_members", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	roomId: bigint("room_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	role: varchar({ length: 16 }).default('member').notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	lastReadMessageId: bigint("last_read_message_id", { mode: "number" }),
	joinedAt: timestamp("joined_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	leftAt: timestamp("left_at", { withTimezone: true, mode: 'string' }),
	rejoinedAt: timestamp("rejoined_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("idx_chat_members_room_active").using("btree", table.roomId.asc().nullsLast().op("int8_ops")).where(sql`(left_at IS NULL)`),
	index("idx_chat_members_user_active").using("btree", table.userId.asc().nullsLast().op("int8_ops")).where(sql`(left_at IS NULL)`),
	foreignKey({
			columns: [table.roomId],
			foreignColumns: [chatRooms.id],
			name: "chat_room_members_room_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "chat_room_members_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.lastReadMessageId],
			foreignColumns: [chatMessages.id],
			name: "fk_chat_room_members_last_read_message_id"
		}),
	primaryKey({ columns: [table.roomId, table.userId], name: "chat_room_members_pkey"}),
	check("active_state", sql`(left_at IS NULL) OR (rejoined_at IS NULL)`),
]);
