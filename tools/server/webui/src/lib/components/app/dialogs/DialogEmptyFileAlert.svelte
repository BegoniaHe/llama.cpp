<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as m from '$lib/paraglide/messages';
	import { FileX } from '@lucide/svelte';

	interface Props {
		open: boolean;
		emptyFiles: string[];
		onOpenChange?: (open: boolean) => void;
	}

	let { open = $bindable(), emptyFiles, onOpenChange }: Props = $props();

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		onOpenChange?.(newOpen);
	}
</script>

<AlertDialog.Root {open} onOpenChange={handleOpenChange}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title class="flex items-center gap-2">
				<FileX class="h-5 w-5 text-destructive" />

				{m.dialog_empty_file_alert_title()}
			</AlertDialog.Title>

			<AlertDialog.Description>
				{m.dialog_empty_file_alert_description()}
			</AlertDialog.Description>
		</AlertDialog.Header>

		<div class="space-y-3 text-sm">
			<div class="rounded-lg bg-muted p-3">
				<div class="mb-2 font-medium">{m.dialog_empty_file_alert_empty_files_heading()}</div>

				<ul class="list-inside list-disc space-y-1 text-muted-foreground">
					{#each emptyFiles as fileName (fileName)}
						<li class="font-mono text-sm">{fileName}</li>
					{/each}
				</ul>
			</div>

			<div>
				<div class="mb-2 font-medium">{m.dialog_empty_file_alert_what_happened_heading()}</div>

				<ul class="list-inside list-disc space-y-1 text-muted-foreground">
					<li>{m.dialog_empty_file_alert_reason_empty_files()}</li>

					<li>{m.dialog_empty_file_alert_reason_removed()}</li>

					<li>{m.dialog_empty_file_alert_reason_try_content()}</li>
				</ul>
			</div>
		</div>

		<AlertDialog.Footer>
			<AlertDialog.Action onclick={() => handleOpenChange(false)}
				>{m.chat_file_upload_got_it()}</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
