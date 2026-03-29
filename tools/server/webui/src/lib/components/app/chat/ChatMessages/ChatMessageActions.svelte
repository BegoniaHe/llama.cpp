<script lang="ts">
	import {
		ActionIcon,
		ChatMessageBranchingControls,
		DialogConfirmation
	} from '$lib/components/app';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { Switch } from '$lib/components/ui/switch';
	import { MessageRole } from '$lib/enums';
	import { m } from '$lib/paraglide/messages';
	import { activeConversation } from '$lib/stores/conversations.svelte';
	import { ArrowRight, Copy, Edit, GitBranch, RefreshCw, Trash2 } from '@lucide/svelte';

	interface Props {
		role: MessageRole.USER | MessageRole.ASSISTANT;
		justify: 'start' | 'end';
		actionsPosition: 'left' | 'right';
		siblingInfo?: ChatMessageSiblingInfo | null;
		showDeleteDialog: boolean;
		deletionInfo: {
			totalCount: number;
			userMessages: number;
			assistantMessages: number;
			messageTypes: string[];
		} | null;
		onCopy: () => void;
		onEdit?: () => void;
		onRegenerate?: () => void;
		onContinue?: () => void;
		onForkConversation?: (options: { name: string; includeAttachments: boolean }) => void;
		onDelete: () => void;
		onConfirmDelete: () => void;
		onNavigateToSibling?: (siblingId: string) => void;
		onShowDeleteDialogChange: (show: boolean) => void;
		showRawOutputSwitch?: boolean;
		rawOutputEnabled?: boolean;
		onRawOutputToggle?: (enabled: boolean) => void;
	}

	let {
		actionsPosition,
		deletionInfo,
		justify,
		onCopy,
		onEdit,
		onConfirmDelete,
		onContinue,
		onDelete,
		onForkConversation,
		onNavigateToSibling,
		onShowDeleteDialogChange,
		onRegenerate,
		role,
		siblingInfo = null,
		showDeleteDialog,
		showRawOutputSwitch = false,
		rawOutputEnabled = false,
		onRawOutputToggle
	}: Props = $props();

	let showForkDialog = $state(false);
	let forkName = $state('');
	let forkIncludeAttachments = $state(true);

	function handleConfirmDelete() {
		onConfirmDelete();
		onShowDeleteDialogChange(false);
	}

	function handleOpenForkDialog() {
		const conv = activeConversation();

		forkName = m.chat_message_fork_default_name({
			title: conv?.name ?? m.chat_message_fork_fallback_conversation()
		});
		forkIncludeAttachments = true;
		showForkDialog = true;
	}

	function handleConfirmFork() {
		onForkConversation?.({ name: forkName.trim(), includeAttachments: forkIncludeAttachments });
		showForkDialog = false;
	}
</script>

<div class="relative {justify === 'start' ? 'mt-2' : ''} flex h-6 items-center justify-between">
	<div
		class="{actionsPosition === 'left'
			? 'left-0'
			: 'right-0'} flex items-center gap-2 opacity-100 transition-opacity"
	>
		{#if siblingInfo && siblingInfo.totalSiblings > 1}
			<ChatMessageBranchingControls {siblingInfo} {onNavigateToSibling} />
		{/if}

		<div
			class="pointer-events-auto inset-0 flex items-center gap-1 opacity-100 transition-all duration-150"
		>
			<ActionIcon icon={Copy} tooltip={m.chat_message_action_copy()} onclick={onCopy} />

			{#if onEdit}
				<ActionIcon icon={Edit} tooltip={m.chat_message_action_edit()} onclick={onEdit} />
			{/if}

			{#if role === MessageRole.ASSISTANT && onRegenerate}
				<ActionIcon
					icon={RefreshCw}
					tooltip={m.chat_message_action_regenerate()}
					onclick={() => onRegenerate()}
				/>
			{/if}

			{#if role === MessageRole.ASSISTANT && onContinue}
				<ActionIcon icon={ArrowRight} tooltip={m.chat_message_action_continue()} onclick={onContinue} />
			{/if}

			{#if onForkConversation}
				<ActionIcon
					icon={GitBranch}
					tooltip={m.chat_message_action_fork_conversation()}
					onclick={handleOpenForkDialog}
				/>
			{/if}

			<ActionIcon icon={Trash2} tooltip={m.chat_message_action_delete()} onclick={onDelete} />
		</div>
	</div>

	{#if showRawOutputSwitch}
		<div class="flex items-center gap-2">
			<span class="text-xs text-muted-foreground">{m.chat_message_action_show_raw_output()}</span>
			<Switch
				checked={rawOutputEnabled}
				onCheckedChange={(checked) => onRawOutputToggle?.(checked)}
			/>
		</div>
	{/if}
</div>

<DialogConfirmation
	bind:open={showDeleteDialog}
	title={m.chat_message_delete_title()}
	description={deletionInfo && deletionInfo.totalCount > 1
		? m.chat_message_delete_description_multiple({
				count: String(deletionInfo.totalCount),
				userCount: String(deletionInfo.userMessages),
				assistantCount: String(deletionInfo.assistantMessages)
			})
		: m.chat_message_delete_description_single()}
	confirmText={deletionInfo && deletionInfo.totalCount > 1
		? m.chat_message_delete_confirm_multiple({ count: String(deletionInfo.totalCount) })
		: m.chat_message_action_delete()}
	cancelText={m.chat_sidebar_cancel()}
	variant="destructive"
	icon={Trash2}
	onConfirm={handleConfirmDelete}
	onCancel={() => onShowDeleteDialogChange(false)}
/>

<DialogConfirmation
	bind:open={showForkDialog}
	title={m.chat_message_fork_title()}
	description={m.chat_message_fork_description()}
	confirmText={m.chat_message_fork_confirm()}
	cancelText={m.chat_sidebar_cancel()}
	icon={GitBranch}
	onConfirm={handleConfirmFork}
	onCancel={() => (showForkDialog = false)}
>
	<div class="flex flex-col gap-4 py-2">
		<div class="flex flex-col gap-2">
			<Label for="fork-name">{m.chat_message_fork_label_title()}</Label>

			<Input
				id="fork-name"
				class="text-foreground"
				placeholder={m.chat_message_fork_placeholder()}
				type="text"
				bind:value={forkName}
			/>
		</div>

		<div class="flex items-center gap-2">
			<Checkbox
				id="fork-attachments"
				checked={forkIncludeAttachments}
				onCheckedChange={(checked) => {
					forkIncludeAttachments = checked === true;
				}}
			/>

			<Label for="fork-attachments" class="cursor-pointer text-sm font-normal">
				{m.chat_message_fork_include_attachments()}
			</Label>
		</div>
	</div>
</DialogConfirmation>
