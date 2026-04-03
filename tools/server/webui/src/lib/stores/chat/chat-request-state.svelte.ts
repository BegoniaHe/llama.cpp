import {
	INACTIVE_CONVERSATION_STATE_MAX_AGE_MS,
	MAX_INACTIVE_CONVERSATION_STATES
} from '$lib/constants';
import type { ApiProcessingState } from '$lib/types';
import { SvelteMap } from 'svelte/reactivity';

interface ConversationStateEntry {
	lastAccessed: number;
}

export interface ChatStreamingEntry {
	response: string;
	messageId: string;
}

const uniqueConversationIds = (conversationIds: string[]): string[] =>
	conversationIds.filter(
		(conversationId, index) => conversationIds.indexOf(conversationId) === index
	);

export class ChatRequestStateManager {
	activeProcessingState = $state<ApiProcessingState | null>(null);
	currentResponse = $state('');
	isLoading = $state(false);

	private activeConversationId = $state<string | null>(null);
	private isStreamingActive = $state(false);
	private chatLoadingStates = new SvelteMap<string, boolean>();
	private chatStreamingStates = new SvelteMap<string, ChatStreamingEntry>();
	private abortControllers = new SvelteMap<string, AbortController>();
	private processingStates = new SvelteMap<string, ApiProcessingState | null>();
	private conversationStateTimestamps = new SvelteMap<string, ConversationStateEntry>();

	setChatLoading(convId: string, loading: boolean, isActiveConversation: boolean): void {
		this.touchConversationState(convId);
		if (loading) {
			this.chatLoadingStates.set(convId, true);
			if (isActiveConversation) this.isLoading = true;
		} else {
			this.chatLoadingStates.delete(convId);
			if (isActiveConversation) this.isLoading = false;
		}
	}

	setChatStreaming(
		convId: string,
		response: string,
		messageId: string,
		isActiveConversation: boolean
	): void {
		this.touchConversationState(convId);
		this.chatStreamingStates.set(convId, { response, messageId });
		if (isActiveConversation) this.currentResponse = response;
	}

	clearChatStreaming(convId: string, isActiveConversation: boolean): void {
		this.chatStreamingStates.delete(convId);
		if (isActiveConversation) this.currentResponse = '';
	}

	getChatStreaming(convId: string): ChatStreamingEntry | undefined {
		return this.chatStreamingStates.get(convId);
	}

	syncLoadingStateForChat(
		convId: string,
		syncStreamingMessage?: (messageId: string, response: string) => void
	): void {
		this.isLoading = this.chatLoadingStates.get(convId) || false;
		const streamingState = this.chatStreamingStates.get(convId);
		this.currentResponse = streamingState?.response || '';
		this.isStreamingActive = streamingState !== undefined;
		this.setActiveProcessingConversation(convId);

		if (streamingState?.response && streamingState?.messageId) {
			syncStreamingMessage?.(streamingState.messageId, streamingState.response);
		}
	}

	clearUIState(): void {
		this.isLoading = false;
		this.currentResponse = '';
		this.isStreamingActive = false;
	}

	setActiveProcessingConversation(conversationId: string | null): void {
		this.activeConversationId = conversationId;
		this.activeProcessingState = conversationId
			? this.processingStates.get(conversationId) || null
			: null;
	}

	getActiveConversationId(): string | null {
		return this.activeConversationId;
	}

	getProcessingState(conversationId: string): ApiProcessingState | null {
		return this.processingStates.get(conversationId) || null;
	}

	setProcessingState(conversationId: string, state: ApiProcessingState | null): void {
		if (state === null) this.processingStates.delete(conversationId);
		else this.processingStates.set(conversationId, state);

		if (conversationId === this.activeConversationId) {
			this.activeProcessingState = state;
		}
	}

	clearProcessingState(conversationId: string): void {
		this.processingStates.delete(conversationId);
		if (conversationId === this.activeConversationId) this.activeProcessingState = null;
	}

	getActiveProcessingState(): ApiProcessingState | null {
		return this.activeProcessingState;
	}

	getCurrentProcessingStateSync(): ApiProcessingState | null {
		return this.activeProcessingState;
	}

	setStreamingActive(active: boolean): void {
		this.isStreamingActive = active;
	}

	isStreaming(): boolean {
		return this.isStreamingActive;
	}

	getOrCreateAbortController(convId: string): AbortController {
		let controller = this.abortControllers.get(convId);
		if (!controller || controller.signal.aborted) {
			controller = new AbortController();
			this.abortControllers.set(convId, controller);
		}
		return controller;
	}

	abortRequest(convId?: string): void {
		if (convId) {
			const controller = this.abortControllers.get(convId);
			if (controller) {
				controller.abort();
				this.abortControllers.delete(convId);
			}
			return;
		}

		for (const controller of this.abortControllers.values()) controller.abort();
		this.abortControllers.clear();
	}

	getAllLoadingChats(): string[] {
		return Array.from(this.chatLoadingStates.keys());
	}

	getAllStreamingChats(): string[] {
		return Array.from(this.chatStreamingStates.keys());
	}

	isChatLoadingPublic(convId: string): boolean {
		return this.chatLoadingStates.get(convId) || false;
	}

	hasActiveRequest(convId: string): boolean {
		return this.chatLoadingStates.get(convId) || false || this.chatStreamingStates.has(convId);
	}

	private touchConversationState(convId: string): void {
		this.conversationStateTimestamps.set(convId, { lastAccessed: Date.now() });
	}

	cleanupOldConversationStates(activeConversationIds?: string[]): number {
		const now = Date.now();
		const activeIdsList = activeConversationIds ?? [];
		const preserveIds = this.activeConversationId
			? [...activeIdsList, this.activeConversationId]
			: activeIdsList;
		const allConversationIds = uniqueConversationIds([
			...this.chatLoadingStates.keys(),
			...this.chatStreamingStates.keys(),
			...this.abortControllers.keys(),
			...this.processingStates.keys(),
			...this.conversationStateTimestamps.keys()
		]);
		const cleanupCandidates: Array<{ convId: string; lastAccessed: number }> = [];

		for (const convId of allConversationIds) {
			if (preserveIds.includes(convId)) continue;
			if (this.chatLoadingStates.get(convId)) continue;
			if (this.chatStreamingStates.has(convId)) continue;

			const timestamp = this.conversationStateTimestamps.get(convId);
			cleanupCandidates.push({ convId, lastAccessed: timestamp?.lastAccessed ?? 0 });
		}

		cleanupCandidates.sort((left, right) => left.lastAccessed - right.lastAccessed);

		let cleanedUp = 0;
		for (const { convId, lastAccessed } of cleanupCandidates) {
			if (
				cleanupCandidates.length - cleanedUp > MAX_INACTIVE_CONVERSATION_STATES ||
				now - lastAccessed > INACTIVE_CONVERSATION_STATE_MAX_AGE_MS
			) {
				this.cleanupConversationState(convId);
				cleanedUp++;
			}
		}

		return cleanedUp;
	}

	private cleanupConversationState(convId: string): void {
		const controller = this.abortControllers.get(convId);
		if (controller && !controller.signal.aborted) controller.abort();

		this.chatLoadingStates.delete(convId);
		this.chatStreamingStates.delete(convId);
		this.abortControllers.delete(convId);
		this.processingStates.delete(convId);
		this.conversationStateTimestamps.delete(convId);
	}

	getTrackedConversationCount(): number {
		return uniqueConversationIds([
			...this.chatLoadingStates.keys(),
			...this.chatStreamingStates.keys(),
			...this.abortControllers.keys(),
			...this.processingStates.keys()
		]).length;
	}
}
