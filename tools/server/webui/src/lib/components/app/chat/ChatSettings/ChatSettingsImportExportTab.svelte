<script lang="ts">
	import { DialogConfirmation, DialogConversationSelection } from '$lib/components/app';
	import { Button } from '$lib/components/ui/button';
	import { ISO_DATE_TIME_SEPARATOR } from '$lib/constants';
	import { m } from '$lib/paraglide/messages';
	import { conversations, conversationsStore } from '$lib/stores/conversations.svelte';
	import { createMessageCountMap } from '$lib/utils';
	import { Download, Trash2, Upload } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let exportedConversations = $state<DatabaseConversation[]>([]);
	let importedConversations = $state<DatabaseConversation[]>([]);
	let showExportSummary = $state(false);
	let showImportSummary = $state(false);

	let showExportDialog = $state(false);
	let showImportDialog = $state(false);
	let availableConversations = $state<DatabaseConversation[]>([]);
	let messageCountMap = $state<Map<string, number>>(new Map());
	let fullImportData = $state<Array<{ conv: DatabaseConversation; messages: DatabaseMessage[] }>>(
		[]
	);

	// Delete functionality state
	let showDeleteDialog = $state(false);

	async function handleExportClick() {
		try {
			const allConversations = conversations();
			if (allConversations.length === 0) {
				toast.info(m.settings_import_export_no_conversations_to_export());
				return;
			}

			const conversationsWithMessages = await Promise.all(
				allConversations.map(async (conv: DatabaseConversation) => {
					const messages = await conversationsStore.getConversationMessages(conv.id);
					return { conv, messages };
				})
			);

			messageCountMap = createMessageCountMap(conversationsWithMessages);
			availableConversations = allConversations;
			showExportDialog = true;
		} catch (err) {
			console.error('Failed to load conversations:', err);
			alert(m.settings_import_export_failed_to_load_conversations());
		}
	}

	async function handleExportConfirm(selectedConversations: DatabaseConversation[]) {
		try {
			const allData: ExportedConversations = await Promise.all(
				selectedConversations.map(async (conv) => {
					const messages = await conversationsStore.getConversationMessages(conv.id);
					return { conv: $state.snapshot(conv), messages: $state.snapshot(messages) };
				})
			);

			conversationsStore.downloadConversationFile(
				allData,
				`${new Date().toISOString().split(ISO_DATE_TIME_SEPARATOR)[0]}_conversations.json`
			);

			exportedConversations = selectedConversations;
			showExportSummary = true;
			showImportSummary = false;
			showExportDialog = false;
		} catch (err) {
			console.error('Export failed:', err);
			alert(m.settings_import_export_failed_to_export());
		}
	}

	async function handleImportClick() {
		try {
			const input = document.createElement('input');

			input.type = 'file';
			input.accept = '.json';

			input.onchange = async (e) => {
				const file = (e.target as HTMLInputElement)?.files?.[0];
				if (!file) return;

				try {
					const text = await file.text();
					const parsedData = JSON.parse(text);
					let importedData: ExportedConversations;

					if (Array.isArray(parsedData)) {
						importedData = parsedData;
					} else if (
						parsedData &&
						typeof parsedData === 'object' &&
						'conv' in parsedData &&
						'messages' in parsedData
					) {
						// Single conversation object
						importedData = [parsedData];
					} else {
						throw new Error(m.settings_import_export_invalid_file_format());
					}

					fullImportData = importedData;
					availableConversations = importedData.map(
						(item: { conv: DatabaseConversation; messages: DatabaseMessage[] }) => item.conv
					);
					messageCountMap = createMessageCountMap(importedData);
					showImportDialog = true;
				} catch (err: unknown) {
					const message = err instanceof Error ? err.message : m.unknown_value();

					console.error('Failed to parse file:', err);
					alert(m.settings_import_export_failed_to_parse_file({ message }));
				}
			};

			input.click();
		} catch (err) {
			console.error('Import failed:', err);
			alert(m.settings_import_export_failed_to_import());
		}
	}

	async function handleImportConfirm(selectedConversations: DatabaseConversation[]) {
		try {
			const selectedIds = new Set(selectedConversations.map((c) => c.id));
			const selectedData = $state
				.snapshot(fullImportData)
				.filter((item) => selectedIds.has(item.conv.id));

			await conversationsStore.importConversationsData(selectedData);

			importedConversations = selectedConversations;
			showImportSummary = true;
			showExportSummary = false;
			showImportDialog = false;
		} catch (err) {
			console.error('Import failed:', err);
			alert(m.settings_import_export_failed_to_import_check_format());
		}
	}

	async function handleDeleteAllClick() {
		try {
			const allConversations = conversations();

			if (allConversations.length === 0) {
				toast.info(m.settings_import_export_no_conversations_to_delete());
				return;
			}

			showDeleteDialog = true;
		} catch (err) {
			console.error('Failed to load conversations for deletion:', err);
			toast.error(m.settings_import_export_failed_to_load_conversations());
		}
	}

	async function handleDeleteAllConfirm() {
		try {
			await conversationsStore.deleteAll();

			showDeleteDialog = false;
		} catch (err) {
			console.error('Failed to delete conversations:', err);
		}
	}

	function handleDeleteAllCancel() {
		showDeleteDialog = false;
	}
</script>

<div class="space-y-6">
	<div class="space-y-4">
		<div class="grid">
			<h4 class="mb-2 text-sm font-medium">{m.settings_import_export_export_title()}</h4>

			<p class="mb-4 text-sm text-muted-foreground">
				{m.settings_import_export_export_description()}
			</p>

			<Button
				class="w-full justify-start justify-self-start md:w-auto"
				onclick={handleExportClick}
				variant="outline"
			>
				<Download class="mr-2 h-4 w-4" />

				{m.settings_import_export_export_button()}
			</Button>

			{#if showExportSummary && exportedConversations.length > 0}
				<div class="mt-4 grid overflow-x-auto rounded-lg border border-border/50 bg-muted/30 p-4">
					<h5 class="mb-2 text-sm font-medium">
						{m.settings_import_export_exported_count({
							count: String(exportedConversations.length)
						})}
					</h5>

					<ul class="space-y-1 text-sm text-muted-foreground">
						{#each exportedConversations.slice(0, 10) as conv (conv.id)}
							<li class="truncate">
								• {conv.name || m.settings_import_export_untitled_conversation()}
							</li>
						{/each}

						{#if exportedConversations.length > 10}
							<li class="italic">
								{m.settings_import_export_more_count({
									count: String(exportedConversations.length - 10)
								})}
							</li>
						{/if}
					</ul>
				</div>
			{/if}
		</div>

		<div class="grid border-t border-border/30 pt-4">
			<h4 class="mb-2 text-sm font-medium">{m.settings_import_export_import_title()}</h4>

			<p class="mb-4 text-sm text-muted-foreground">
				{m.settings_import_export_import_description()}
			</p>

			<Button
				class="w-full justify-start justify-self-start md:w-auto"
				onclick={handleImportClick}
				variant="outline"
			>
				<Upload class="mr-2 h-4 w-4" />
				{m.settings_import_export_import_button()}
			</Button>

			{#if showImportSummary && importedConversations.length > 0}
				<div class="mt-4 grid overflow-x-auto rounded-lg border border-border/50 bg-muted/30 p-4">
					<h5 class="mb-2 text-sm font-medium">
						{m.settings_import_export_imported_count({
							count: String(importedConversations.length)
						})}
					</h5>

					<ul class="space-y-1 text-sm text-muted-foreground">
						{#each importedConversations.slice(0, 10) as conv (conv.id)}
							<li class="truncate">
								• {conv.name || m.settings_import_export_untitled_conversation()}
							</li>
						{/each}

						{#if importedConversations.length > 10}
							<li class="italic">
								{m.settings_import_export_more_count({
									count: String(importedConversations.length - 10)
								})}
							</li>
						{/if}
					</ul>
				</div>
			{/if}
		</div>

		<div class="grid border-t border-border/30 pt-4">
			<h4 class="mb-2 text-sm font-medium text-destructive">
				{m.settings_import_export_delete_all_title()}
			</h4>

			<p class="mb-4 text-sm text-muted-foreground">
				{m.settings_import_export_delete_all_description()}
			</p>

			<Button
				class="text-destructive-foreground w-full justify-start justify-self-start bg-destructive hover:bg-destructive/80 md:w-auto"
				onclick={handleDeleteAllClick}
				variant="destructive"
			>
				<Trash2 class="mr-2 h-4 w-4" />

				{m.settings_import_export_delete_all_button()}
			</Button>
		</div>
	</div>
</div>

<DialogConversationSelection
	conversations={availableConversations}
	{messageCountMap}
	mode="export"
	bind:open={showExportDialog}
	onCancel={() => (showExportDialog = false)}
	onConfirm={handleExportConfirm}
/>

<DialogConversationSelection
	conversations={availableConversations}
	{messageCountMap}
	mode="import"
	bind:open={showImportDialog}
	onCancel={() => (showImportDialog = false)}
	onConfirm={handleImportConfirm}
/>

<DialogConfirmation
	bind:open={showDeleteDialog}
	title={m.settings_import_export_delete_all_dialog_title()}
	description={m.settings_import_export_delete_all_dialog_description()}
	confirmText={m.settings_import_export_delete_all_confirm()}
	cancelText={m.chat_sidebar_cancel()}
	variant="destructive"
	icon={Trash2}
	onConfirm={handleDeleteAllConfirm}
	onCancel={handleDeleteAllCancel}
/>
