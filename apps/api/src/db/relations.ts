import { relations } from "drizzle-orm/relations";
import { users, invitations, sessions, chatRooms, chatMessages, chatMessageEdits, chatRoomMembers } from "./schema.js";

export const usersRelations = relations(users, ({one, many}) => ({
	user: one(users, {
		fields: [users.inviterId],
		references: [users.id],
		relationName: "users_inviterId_users_id"
	}),
	users: many(users, {
		relationName: "users_inviterId_users_id"
	}),
	invitation: one(invitations, {
		fields: [users.invitationId],
		references: [invitations.id],
		relationName: "users_invitationId_invitations_id"
	}),
	sessions: many(sessions),
	chatRooms: many(chatRooms),
	invitations: many(invitations, {
		relationName: "invitations_ownerId_users_id"
	}),
	chatMessages: many(chatMessages),
	chatRoomMembers: many(chatRoomMembers),
}));

export const invitationsRelations = relations(invitations, ({one, many}) => ({
	users: many(users, {
		relationName: "users_invitationId_invitations_id"
	}),
	user: one(users, {
		fields: [invitations.ownerId],
		references: [users.id],
		relationName: "invitations_ownerId_users_id"
	}),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const chatRoomsRelations = relations(chatRooms, ({one, many}) => ({
	user: one(users, {
		fields: [chatRooms.createdBy],
		references: [users.id]
	}),
	chatMessages: many(chatMessages),
	chatRoomMembers: many(chatRoomMembers),
}));

export const chatMessagesRelations = relations(chatMessages, ({one, many}) => ({
	chatRoom: one(chatRooms, {
		fields: [chatMessages.roomId],
		references: [chatRooms.id]
	}),
	user: one(users, {
		fields: [chatMessages.senderId],
		references: [users.id]
	}),
	chatMessage: one(chatMessages, {
		fields: [chatMessages.replyToId],
		references: [chatMessages.id],
		relationName: "chatMessages_replyToId_chatMessages_id"
	}),
	chatMessages: many(chatMessages, {
		relationName: "chatMessages_replyToId_chatMessages_id"
	}),
	chatMessageEdits: many(chatMessageEdits),
	chatRoomMembers: many(chatRoomMembers),
}));

export const chatMessageEditsRelations = relations(chatMessageEdits, ({one}) => ({
	chatMessage: one(chatMessages, {
		fields: [chatMessageEdits.messageId],
		references: [chatMessages.id]
	}),
}));

export const chatRoomMembersRelations = relations(chatRoomMembers, ({one}) => ({
	chatRoom: one(chatRooms, {
		fields: [chatRoomMembers.roomId],
		references: [chatRooms.id]
	}),
	user: one(users, {
		fields: [chatRoomMembers.userId],
		references: [users.id]
	}),
	chatMessage: one(chatMessages, {
		fields: [chatRoomMembers.lastReadMessageId],
		references: [chatMessages.id]
	}),
}));