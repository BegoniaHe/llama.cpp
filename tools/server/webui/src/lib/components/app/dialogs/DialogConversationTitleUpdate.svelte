<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { m } from '$lib/paraglide/messages';

	interface Props {
		open: boolean;
		currentTitle: string;
		newTitle: string;
		onConfirm: () => void;
		onCancel: () => void;
	}

	let { open = $bindable(), currentTitle, newTitle, onConfirm, onCancel }: Props = $props();
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{m.dialog_update_conversation_title_title()}</AlertDialog.Title>

			<AlertDialog.Description>
				{m.dialog_update_conversation_title_description()}
			</AlertDialog.Description>
		</AlertDialog.Header>

		<div class="space-y-4 pt-2 pb-6">
			<div class="space-y-2">
				<p class="text-sm font-medium text-muted-foreground">
					{m.dialog_update_conversation_title_current()}
				</p>

				<p class="rounded-md bg-muted/50 p-3 text-sm font-medium">{currentTitle}</p>
			</div>

			<div class="space-y-2">
				<p class="text-sm font-medium text-muted-foreground">
					{m.dialog_update_conversation_title_next()}
				</p>

				<p class="rounded-md bg-muted/50 p-3 text-sm font-medium">{newTitle}</p>
			</div>
		</div>

		<AlertDialog.Footer>
			<Button variant="outline" onclick={onCancel}>
				{m.dialog_update_conversation_title_keep()}
			</Button>

			<Button onclick={onConfirm}>{m.dialog_update_conversation_title_confirm()}</Button>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
