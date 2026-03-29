<script lang="ts">
	import { ConversationSelection } from '$lib/components/app';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		conversations: DatabaseConversation[];
		messageCountMap?: Map<string, number>;
		mode: 'export' | 'import';
		onCancel: () => void;
		onConfirm: (selectedConversations: DatabaseConversation[]) => void;
		open?: boolean;
	}

	let {
		conversations,
		messageCountMap = new Map(),
		mode,
		onCancel,
		onConfirm,
		open = $bindable(false)
	}: Props = $props();

	let conversationSelectionRef: ConversationSelection | undefined = $state();

	let previousOpen = $state(false);

	$effect(() => {
		if (open && !previousOpen && conversationSelectionRef) {
			conversationSelectionRef.reset();
		} else if (!open && previousOpen) {
			onCancel();
		}

		previousOpen = open;
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay class="z-[1000000]" />

		<Dialog.Content class="z-[1000001] max-w-2xl">
			<Dialog.Header>
				<Dialog.Title>
					{mode === 'export'
						? m.dialog_conversation_selection_title_export()
						: m.dialog_conversation_selection_title_import()}
				</Dialog.Title>
				<Dialog.Description>
					{#if mode === 'export'}
						{m.dialog_conversation_selection_description_export()}
					{:else}
						{m.dialog_conversation_selection_description_import()}
					{/if}
				</Dialog.Description>
			</Dialog.Header>

			<ConversationSelection
				bind:this={conversationSelectionRef}
				{conversations}
				{messageCountMap}
				{mode}
				{onCancel}
				{onConfirm}
			/>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
