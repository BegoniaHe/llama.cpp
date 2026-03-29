<script lang="ts">
	import { McpLogo } from '$lib/components/app';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import { FILE_TYPE_ICONS } from '$lib/constants';
	import { m } from '$lib/paraglide/messages';
	import { FolderOpen, MessageSquare, Plus, Zap } from '@lucide/svelte';

	interface Props {
		class?: string;
		disabled?: boolean;
		hasAudioModality?: boolean;
		hasVisionModality?: boolean;
		hasMcpPromptsSupport?: boolean;
		hasMcpResourcesSupport?: boolean;
		onFileUpload?: () => void;
		onSystemPromptClick?: () => void;
		onMcpPromptClick?: () => void;
		onMcpSettingsClick?: () => void;
		onMcpResourcesClick?: () => void;
	}

	let {
		class: className = '',
		disabled = false,
		hasAudioModality = false,
		hasVisionModality = false,
		hasMcpPromptsSupport = false,
		hasMcpResourcesSupport = false,
		onFileUpload,
		onSystemPromptClick,
		onMcpPromptClick,
		onMcpSettingsClick,
		onMcpResourcesClick
	}: Props = $props();

	let sheetOpen = $state(false);

	function handleMcpPromptClick() {
		sheetOpen = false;
		onMcpPromptClick?.();
	}

	function handleMcpSettingsClick() {
		onMcpSettingsClick?.();
	}

	function handleMcpResourcesClick() {
		sheetOpen = false;
		onMcpResourcesClick?.();
	}

	function handleSheetFileUpload() {
		sheetOpen = false;
		onFileUpload?.();
	}

	function handleSheetSystemPromptClick() {
		sheetOpen = false;
		onSystemPromptClick?.();
	}

	const fileUploadTooltipText = m.chat_attachment_add_menu_tooltip();

	const sheetItemClass =
		'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent active:bg-accent disabled:cursor-not-allowed disabled:opacity-50';
</script>

<div class="flex items-center gap-1 {className}">
	<Sheet.Root bind:open={sheetOpen}>
		<Button
			class="file-upload-button h-8 w-8 rounded-full p-0"
			{disabled}
			variant="secondary"
			type="button"
			onclick={() => (sheetOpen = true)}
		>
			<span class="sr-only">{fileUploadTooltipText}</span>

			<Plus class="h-4 w-4" />
		</Button>

		<Sheet.Content side="bottom" class="max-h-[85vh] gap-0">
			<Sheet.Header>
				<Sheet.Title>{m.chat_attachment_sheet_title()}</Sheet.Title>

				<Sheet.Description class="sr-only">
					{m.chat_attachment_sheet_description()}
				</Sheet.Description>
			</Sheet.Header>

			<div class="flex flex-col gap-1 overflow-y-auto px-1.5 pb-2">
				<!-- Images -->
				<button
					type="button"
					class={sheetItemClass}
					disabled={!hasVisionModality}
					onclick={handleSheetFileUpload}
				>
					<FILE_TYPE_ICONS.image class="h-4 w-4 shrink-0" />

					<span>{m.chat_attachment_images()}</span>

					{#if !hasVisionModality}
						<span class="ml-auto text-xs text-muted-foreground"
							>{m.chat_attachment_requires_vision_model()}</span
						>
					{/if}
				</button>

				<!-- Audio -->
				<button
					type="button"
					class={sheetItemClass}
					disabled={!hasAudioModality}
					onclick={handleSheetFileUpload}
				>
					<FILE_TYPE_ICONS.audio class="h-4 w-4 shrink-0" />

					<span>{m.chat_attachment_audio_files()}</span>

					{#if !hasAudioModality}
						<span class="ml-auto text-xs text-muted-foreground"
							>{m.chat_attachment_requires_audio_model()}</span
						>
					{/if}
				</button>

				<button type="button" class={sheetItemClass} onclick={handleSheetFileUpload}>
					<FILE_TYPE_ICONS.text class="h-4 w-4 shrink-0" />

					<span>{m.chat_attachment_text_files()}</span>
				</button>

				<button type="button" class={sheetItemClass} onclick={handleSheetFileUpload}>
					<FILE_TYPE_ICONS.pdf class="h-4 w-4 shrink-0" />

					<span>{m.chat_attachment_pdf_files()}</span>

					{#if !hasVisionModality}
						<span class="ml-auto text-xs text-muted-foreground"
							>{m.chat_attachment_text_only()}</span
						>
					{/if}
				</button>

				<button type="button" class={sheetItemClass} onclick={handleSheetSystemPromptClick}>
					<MessageSquare class="h-4 w-4 shrink-0" />

					<span>{m.settings_field_system_message_label()}</span>
				</button>

				<button type="button" class={sheetItemClass} onclick={handleMcpSettingsClick}>
					<McpLogo class="h-4 w-4 shrink-0" />

					<span>{m.chat_sidebar_mcp_servers()}</span>
				</button>

				{#if hasMcpPromptsSupport}
					<button type="button" class={sheetItemClass} onclick={handleMcpPromptClick}>
						<Zap class="h-4 w-4 shrink-0" />

						<span>{m.attachment_label_mcp_prompt()}</span>
					</button>
				{/if}

				{#if hasMcpResourcesSupport}
					<button type="button" class={sheetItemClass} onclick={handleMcpResourcesClick}>
						<FolderOpen class="h-4 w-4 shrink-0" />

						<span>{m.mcp_resources_title()}</span>
					</button>
				{/if}
			</div>
		</Sheet.Content>
	</Sheet.Root>
</div>
