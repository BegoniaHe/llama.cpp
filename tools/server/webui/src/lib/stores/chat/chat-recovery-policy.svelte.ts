import { ErrorDialogType } from '$lib/enums';
import type { DatabaseMessage } from '$lib/types';
import type { ErrorDialogState } from '$lib/types/chat';
import { isAbortError } from '$lib/utils';

import type { ChatMessageMutations } from './chat-message-mutations';
import type { ChatRequestStateManager } from './chat-request-state.svelte';

interface ErrorWithContext extends Error {
	contextInfo?: { n_prompt_tokens: number; n_ctx: number };
}

interface StreamingFailureOptions {
	error: Error;
	conversationId: string;
	assistantMessageId: string;
	onError?: (error: Error) => void;
}

interface ContinueFailureOptions {
	error: Error;
	conversationId: string;
	messageId: string;
	originalContent: string;
	originalReasoning: string;
	appendedContent: string;
	appendedReasoning: string;
	hasReceivedContent: boolean;
}

export class ChatRecoveryPolicy {
	errorDialogState = $state<ErrorDialogState | null>(null);

	constructor(
		private readonly requestState: ChatRequestStateManager,
		private readonly messageMutations: ChatMessageMutations
	) {}

	dismissErrorDialog(): void {
		this.errorDialogState = null;
	}

	clearErrorDialog(): void {
		this.errorDialogState = null;
	}

	showErrorDialog(state: ErrorDialogState | null): void {
		this.errorDialogState = state;
	}

	handleRequestFailure(error: unknown, conversationId: string): boolean {
		this.requestState.setChatLoading(conversationId, false, true);
		this.requestState.setProcessingState(conversationId, null);

		if (isAbortError(error)) {
			return true;
		}

		this.errorDialogState = this.toDialogState(error);
		return false;
	}

	async handleStreamingFailure(options: StreamingFailureOptions): Promise<boolean> {
		const { error, conversationId, assistantMessageId, onError } = options;

		this.cleanupConversationRequest(conversationId, true);

		if (isAbortError(error)) {
			return true;
		}

		await this.messageMutations.removeActiveMessageAndDelete(assistantMessageId);
		this.errorDialogState = this.toDialogState(error);
		onError?.(error);
		return false;
	}

	async handleContinueFailure(options: ContinueFailureOptions): Promise<boolean> {
		const {
			error,
			conversationId,
			messageId,
			originalContent,
			originalReasoning,
			appendedContent,
			appendedReasoning,
			hasReceivedContent
		} = options;

		if (isAbortError(error)) {
			if (hasReceivedContent && (appendedContent || appendedReasoning)) {
				await this.messageMutations.persistAndUpdateMessage(messageId, {
					content: originalContent + appendedContent,
					reasoningContent: originalReasoning + appendedReasoning || undefined,
					timestamp: Date.now()
				} satisfies Partial<DatabaseMessage>);
			}

			this.cleanupConversationRequest(conversationId, true);
			return true;
		}

		await this.messageMutations.persistAndUpdateMessage(messageId, {
			content: originalContent,
			reasoningContent: originalReasoning || undefined
		} satisfies Partial<DatabaseMessage>);

		this.cleanupConversationRequest(conversationId, true);
		this.errorDialogState = this.toDialogState(error);
		return false;
	}

	private cleanupConversationRequest(conversationId: string, isActiveConversation: boolean): void {
		this.requestState.setStreamingActive(false);
		this.requestState.setChatLoading(conversationId, false, isActiveConversation);
		this.requestState.clearChatStreaming(conversationId, isActiveConversation);
		this.requestState.setProcessingState(conversationId, null);
	}

	private toDialogState(error: unknown): ErrorDialogState {
		const normalizedError: ErrorWithContext =
			error instanceof Error ? (error as ErrorWithContext) : new Error(String(error));
		return {
			type:
				normalizedError.name === 'TimeoutError' ? ErrorDialogType.TIMEOUT : ErrorDialogType.SERVER,
			message: normalizedError.message || 'Unknown error',
			contextInfo: normalizedError.contextInfo
		};
	}
}
