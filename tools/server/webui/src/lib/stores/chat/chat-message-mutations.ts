import { MessageRole, MessageType } from '$lib/enums';
import { DatabaseService } from '$lib/services';
import { conversationsStore } from '$lib/stores/conversations.svelte';
import type { ApiProcessingState, DatabaseMessage, DatabaseMessageExtra } from '$lib/types';
import type { ChatMessageTimings } from '$lib/types/chat';

export class ChatMessageMutations {
	updateActiveMessage(messageId: string, updates: Partial<DatabaseMessage>): void {
		const index = conversationsStore.findMessageIndex(messageId);
		if (index !== -1) conversationsStore.updateMessageAtIndex(index, updates);
	}

	removeActiveMessage(messageId: string): DatabaseMessage | undefined {
		const index = conversationsStore.findMessageIndex(messageId);
		if (index === -1) return undefined;
		return conversationsStore.removeMessageAtIndex(index);
	}

	async removeActiveMessageAndDelete(messageId: string): Promise<void> {
		const removed = this.removeActiveMessage(messageId);
		if (removed) {
			await DatabaseService.deleteMessage(removed.id);
			return;
		}

		await DatabaseService.deleteMessage(messageId);
	}

	async persistMessage(messageId: string, updates: Partial<DatabaseMessage>): Promise<void> {
		await DatabaseService.updateMessage(messageId, updates);
	}

	async persistAndUpdateMessage(
		messageId: string,
		updates: Partial<DatabaseMessage>,
		options?: { updateCurrentNode?: boolean }
	): Promise<void> {
		await this.persistMessage(messageId, updates);
		this.updateActiveMessage(messageId, updates);

		if (options?.updateCurrentNode) {
			await conversationsStore.updateCurrentNode(messageId);
		}
	}

	updateStreamingMessageContent(messageId: string, content: string): void {
		this.updateActiveMessage(messageId, { content });
	}

	updateStreamingReasoning(messageId: string, reasoningContent: string): void {
		this.updateActiveMessage(messageId, { reasoningContent });
	}

	updateStreamingToolCalls(messageId: string, toolCalls: string): void {
		this.updateActiveMessage(messageId, { toolCalls });
	}

	async appendMessageExtras(messageId: string, extras: DatabaseMessageExtra[]): Promise<void> {
		if (!extras.length) return;

		const index = conversationsStore.findMessageIndex(messageId);
		if (index === -1) return;

		const message = conversationsStore.activeMessages[index];
		const updatedExtras = [...(message.extra || []), ...extras];

		conversationsStore.updateMessageAtIndex(index, { extra: updatedExtras });
		await DatabaseService.updateMessage(messageId, { extra: updatedExtras });
	}

	async createAssistantMessage(
		conversationId: string,
		parentId?: string | null,
		model: string | null = null
	): Promise<DatabaseMessage> {
		return await DatabaseService.createMessageBranch(
			{
				convId: conversationId,
				type: MessageType.TEXT,
				role: MessageRole.ASSISTANT,
				content: '',
				timestamp: Date.now(),
				toolCalls: '',
				children: [],
				model
			},
			parentId ?? null
		);
	}

	async createToolResultMessage(
		conversationId: string,
		parentId: string,
		toolCallId: string,
		content: string,
		extras?: DatabaseMessageExtra[]
	): Promise<DatabaseMessage> {
		return await DatabaseService.createMessageBranch(
			{
				convId: conversationId,
				type: MessageType.TEXT,
				role: MessageRole.TOOL,
				content,
				toolCallId,
				timestamp: Date.now(),
				toolCalls: '',
				children: [],
				extra: extras
			},
			parentId
		);
	}

	async savePartialAssistantResponse(
		conversationId: string,
		response: string,
		processingState: ApiProcessingState | null
	): Promise<void> {
		if (!response.trim()) return;

		const messages =
			conversationId === conversationsStore.activeConversation?.id
				? conversationsStore.activeMessages
				: await conversationsStore.getConversationMessages(conversationId);
		if (!messages.length) return;

		const lastMessage = messages[messages.length - 1];
		if (lastMessage?.role !== MessageRole.ASSISTANT) return;

		const updateData: { content: string; reasoningContent?: string; timings?: ChatMessageTimings } =
			{
				content: response
			};

		if (processingState) {
			updateData.timings = {
				prompt_n: processingState.promptTokens || 0,
				prompt_ms: processingState.promptMs,
				predicted_n: processingState.tokensDecoded || 0,
				cache_n: processingState.cacheTokens || 0,
				predicted_ms:
					processingState.tokensPerSecond && processingState.tokensDecoded
						? (processingState.tokensDecoded / processingState.tokensPerSecond) * 1000
						: undefined
			};
		}

		try {
			await DatabaseService.updateMessage(lastMessage.id, updateData);
		} catch (error) {
			console.error('Failed to save partial response:', error);
		}

		this.updateActiveMessage(lastMessage.id, updateData);
	}
}
