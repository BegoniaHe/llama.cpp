<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { ChatSidebarConversationItem, DialogConfirmation } from '$lib/components/app';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import Input from '$lib/components/ui/input/input.svelte';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { m } from '$lib/paraglide/messages';
	import { chatStore } from '$lib/stores/chat.svelte';
	import { conversations, conversationsStore } from '$lib/stores/conversations.svelte';
	import { getPreviewText } from '$lib/utils';
	import { Trash2 } from '@lucide/svelte';
	import ChatSidebarActions from './ChatSidebarActions.svelte';

	const sidebar = Sidebar.useSidebar();

	let currentChatId = $derived(page.params.id);
	let isSearchModeActive = $state(false);
	let searchQuery = $state('');
	let showDeleteDialog = $state(false);
	let showEditDialog = $state(false);
	let selectedConversation = $state<DatabaseConversation | null>(null);
	let editedName = $state('');
	let selectedConversationNamePreview = $derived.by(() =>
		selectedConversation ? getPreviewText(selectedConversation.name) : ''
	);

	let filteredConversations = $derived.by(() => {
		if (searchQuery.trim().length > 0) {
			return conversations().filter((conversation: { name: string }) =>
				conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		return conversations();
	});

	async function handleDeleteConversation(id: string) {
		const conversation = conversations().find((conv) => conv.id === id);
		if (conversation) {
			selectedConversation = conversation;
			showDeleteDialog = true;
		}
	}

	async function handleEditConversation(id: string) {
		const conversation = conversations().find((conv) => conv.id === id);
		if (conversation) {
			selectedConversation = conversation;
			editedName = conversation.name;
			showEditDialog = true;
		}
	}

	function handleConfirmDelete() {
		if (selectedConversation) {
			showDeleteDialog = false;

			setTimeout(() => {
				conversationsStore.deleteConversation(selectedConversation.id);
				selectedConversation = null;
			}, 100); // Wait for animation to finish
		}
	}

	function handleConfirmEdit() {
		if (!editedName.trim() || !selectedConversation) return;

		showEditDialog = false;

		conversationsStore.updateConversationName(selectedConversation.id, editedName);
		selectedConversation = null;
	}

	export function handleMobileSidebarItemClick() {
		if (sidebar.isMobile) {
			sidebar.toggle();
		}
	}

	export function activateSearchMode() {
		isSearchModeActive = true;
	}

	export function editActiveConversation() {
		if (currentChatId) {
			const activeConversation = filteredConversations.find((conv) => conv.id === currentChatId);

			if (activeConversation) {
				const event = new CustomEvent('edit-active-conversation', {
					detail: { conversationId: currentChatId }
				});
				document.dispatchEvent(event);
			}
		}
	}

	async function selectConversation(id: string) {
		if (isSearchModeActive) {
			isSearchModeActive = false;
			searchQuery = '';
		}

		await goto(`#/chat/${id}`);
	}

	function handleStopGeneration(id: string) {
		chatStore.stopGenerationForChat(id);
	}
</script>

<ScrollArea class="h-[100vh]">
	<Sidebar.Header class=" top-0 z-10 gap-6 bg-sidebar/50 px-4 py-4 pb-2 backdrop-blur-lg md:sticky">
		<a href="#/" onclick={handleMobileSidebarItemClick}>
			<h1 class="inline-flex items-center gap-1 px-2 text-xl font-semibold">llama.cpp</h1>
		</a>

		<ChatSidebarActions {handleMobileSidebarItemClick} bind:isSearchModeActive bind:searchQuery />
	</Sidebar.Header>

	<Sidebar.Group class="mt-4 space-y-2 p-0 px-4">
		{#if (filteredConversations.length > 0 && isSearchModeActive) || !isSearchModeActive}
			<Sidebar.GroupLabel>
				{isSearchModeActive ? m.chat_sidebar_search_results() : m.chat_sidebar_title()}
			</Sidebar.GroupLabel>
		{/if}

		<Sidebar.GroupContent>
			<Sidebar.Menu>
				{#each filteredConversations as conversation (conversation.id)}
					<Sidebar.MenuItem class="mb-1">
						<ChatSidebarConversationItem
							conversation={{
								id: conversation.id,
								name: conversation.name,
								lastModified: conversation.lastModified,
								currNode: conversation.currNode
							}}
							{handleMobileSidebarItemClick}
							isActive={currentChatId === conversation.id}
							onSelect={selectConversation}
							onEdit={handleEditConversation}
							onDelete={handleDeleteConversation}
							onStop={handleStopGeneration}
						/>
					</Sidebar.MenuItem>
				{/each}

				{#if filteredConversations.length === 0}
					<div class="px-2 py-4 text-center">
						<p class="mb-4 p-4 text-sm text-muted-foreground">
							{searchQuery.length > 0
								? m.chat_sidebar_no_results()
								: isSearchModeActive
									? m.chat_sidebar_start_typing()
									: m.chat_sidebar_empty()}
						</p>
					</div>
				{/if}
			</Sidebar.Menu>
		</Sidebar.GroupContent>
	</Sidebar.Group>
</ScrollArea>

<DialogConfirmation
	bind:open={showDeleteDialog}
	title={m.chat_sidebar_delete_title()}
	description={selectedConversation
		? m.chat_sidebar_delete_confirm({ title: selectedConversationNamePreview })
		: ''}
	confirmText={m.chat_sidebar_delete()}
	cancelText={m.chat_sidebar_cancel()}
	variant="destructive"
	icon={Trash2}
	onConfirm={handleConfirmDelete}
	onCancel={() => {
		showDeleteDialog = false;
		selectedConversation = null;
	}}
/>

<AlertDialog.Root bind:open={showEditDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{m.chat_sidebar_edit_title()}</AlertDialog.Title>
			<AlertDialog.Description>
				<Input
					class="mt-4 text-foreground"
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							handleConfirmEdit();
						}
					}}
					placeholder={m.chat_sidebar_edit_placeholder()}
					type="text"
					bind:value={editedName}
				/>
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel
				onclick={() => {
					showEditDialog = false;
					selectedConversation = null;
				}}>{m.chat_sidebar_cancel()}</AlertDialog.Cancel
			>
			<AlertDialog.Action onclick={handleConfirmEdit}>{m.chat_sidebar_save()}</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
