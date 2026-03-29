<script lang="ts">
	import { page } from '$app/state';
	import { DropdownMenuSearchable, McpLogo } from '$lib/components/app';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Switch } from '$lib/components/ui/switch';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { FILE_TYPE_ICONS, TOOLTIP_DELAY_DURATION } from '$lib/constants';
	import { m } from '$lib/paraglide/messages';
	import { conversationsStore } from '$lib/stores/conversations.svelte';
	import { mcpStore } from '$lib/stores/mcp.svelte';
	import { FolderOpen, MessageSquare, Plus, Settings, Zap } from '@lucide/svelte';

	import { HealthCheckStatus } from '$lib/enums';
	import type { MCPServerSettingsEntry } from '$lib/types';

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

	let isNewChat = $derived(!page.params.id);

	let systemMessageTooltip = $derived(
		isNewChat
			? m.chat_attachment_system_message_tooltip_new()
			: m.chat_attachment_system_message_tooltip_existing()
	);

	let dropdownOpen = $state(false);

	let mcpServers = $derived(mcpStore.getServersSorted().filter((s) => s.enabled));
	let hasMcpServers = $derived(mcpServers.length > 0);
	let mcpSearchQuery = $state('');
	let filteredMcpServers = $derived.by(() => {
		const query = mcpSearchQuery.toLowerCase().trim();
		if (!query) return mcpServers;
		return mcpServers.filter((s) => {
			const name = getServerLabel(s).toLowerCase();
			const url = s.url.toLowerCase();
			return name.includes(query) || url.includes(query);
		});
	});

	function getServerLabel(server: MCPServerSettingsEntry): string {
		return mcpStore.getServerLabel(server);
	}

	function isServerEnabledForChat(serverId: string): boolean {
		return conversationsStore.isMcpServerEnabledForChat(serverId);
	}

	async function toggleServerForChat(serverId: string) {
		await conversationsStore.toggleMcpServerForChat(serverId);
	}

	function handleMcpSubMenuOpen(open: boolean) {
		if (open) {
			mcpSearchQuery = '';
			mcpStore.runHealthChecksForServers(mcpServers);
		}
	}

	function handleMcpPromptClick() {
		dropdownOpen = false;
		onMcpPromptClick?.();
	}

	function handleMcpSettingsClick() {
		dropdownOpen = false;
		onMcpSettingsClick?.();
	}

	function handleMcpResourcesClick() {
		dropdownOpen = false;
		onMcpResourcesClick?.();
	}

	const fileUploadTooltipText = m.chat_attachment_add_menu_tooltip();
</script>

<div class="flex items-center gap-1 {className}">
	<DropdownMenu.Root bind:open={dropdownOpen}>
		<DropdownMenu.Trigger name={m.chat_attachment_trigger_name()} {disabled}>
			<Tooltip.Root>
				<Tooltip.Trigger class="w-full">
					<Button
						class="file-upload-button h-8 w-8 rounded-full p-0"
						{disabled}
						variant="secondary"
						type="button"
					>
						<span class="sr-only">{fileUploadTooltipText}</span>

						<Plus class="h-4 w-4" />
					</Button>
				</Tooltip.Trigger>

				<Tooltip.Content>
					<p>{fileUploadTooltipText}</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</DropdownMenu.Trigger>

		<DropdownMenu.Content align="start" class="w-48">
			{#if hasVisionModality}
				<DropdownMenu.Item
					class="images-button flex cursor-pointer items-center gap-2"
					onclick={() => onFileUpload?.()}
				>
					<FILE_TYPE_ICONS.image class="h-4 w-4" />

					<span>{m.chat_attachment_images()}</span>
				</DropdownMenu.Item>
			{:else}
				<Tooltip.Root delayDuration={TOOLTIP_DELAY_DURATION}>
					<Tooltip.Trigger class="w-full">
						<DropdownMenu.Item
							class="images-button flex cursor-pointer items-center gap-2"
							disabled
						>
							<FILE_TYPE_ICONS.image class="h-4 w-4" />

							<span>{m.chat_attachment_images()}</span>
						</DropdownMenu.Item>
					</Tooltip.Trigger>

					<Tooltip.Content side="right">
						<p>{m.chat_attachment_image_requires_vision_model()}</p>
					</Tooltip.Content>
				</Tooltip.Root>
			{/if}

			{#if hasAudioModality}
				<DropdownMenu.Item
					class="audio-button flex cursor-pointer items-center gap-2"
					onclick={() => onFileUpload?.()}
				>
					<FILE_TYPE_ICONS.audio class="h-4 w-4" />

					<span>{m.chat_attachment_audio_files()}</span>
				</DropdownMenu.Item>
			{:else}
				<Tooltip.Root delayDuration={TOOLTIP_DELAY_DURATION}>
					<Tooltip.Trigger class="w-full">
						<DropdownMenu.Item class="audio-button flex cursor-pointer items-center gap-2" disabled>
							<FILE_TYPE_ICONS.audio class="h-4 w-4" />

							<span>{m.chat_attachment_audio_files()}</span>
						</DropdownMenu.Item>
					</Tooltip.Trigger>

					<Tooltip.Content side="right">
						<p>{m.chat_attachment_audio_requires_audio_model()}</p>
					</Tooltip.Content>
				</Tooltip.Root>
			{/if}

			<DropdownMenu.Item
				class="flex cursor-pointer items-center gap-2"
				onclick={() => onFileUpload?.()}
			>
				<FILE_TYPE_ICONS.text class="h-4 w-4" />

				<span>{m.chat_attachment_text_files()}</span>
			</DropdownMenu.Item>

			{#if hasVisionModality}
				<DropdownMenu.Item
					class="flex cursor-pointer items-center gap-2"
					onclick={() => onFileUpload?.()}
				>
					<FILE_TYPE_ICONS.pdf class="h-4 w-4" />

					<span>{m.chat_attachment_pdf_files()}</span>
				</DropdownMenu.Item>
			{:else}
				<Tooltip.Root delayDuration={TOOLTIP_DELAY_DURATION}>
					<Tooltip.Trigger class="w-full">
						<DropdownMenu.Item
							class="flex cursor-pointer items-center gap-2"
							onclick={() => onFileUpload?.()}
						>
							<FILE_TYPE_ICONS.pdf class="h-4 w-4" />

							<span>{m.chat_attachment_pdf_files()}</span>
						</DropdownMenu.Item>
					</Tooltip.Trigger>

					<Tooltip.Content side="right">
						<p>{m.chat_attachment_pdf_text_only_tooltip()}</p>
					</Tooltip.Content>
				</Tooltip.Root>
			{/if}

			<Tooltip.Root delayDuration={TOOLTIP_DELAY_DURATION}>
				<Tooltip.Trigger class="w-full">
					<DropdownMenu.Item
						class="flex cursor-pointer items-center gap-2"
						onclick={() => onSystemPromptClick?.()}
					>
						<MessageSquare class="h-4 w-4" />

						<span>{m.settings_field_system_message_label()}</span>
					</DropdownMenu.Item>
				</Tooltip.Trigger>

				<Tooltip.Content side="right">
					<p>{systemMessageTooltip}</p>
				</Tooltip.Content>
			</Tooltip.Root>

			<DropdownMenu.Separator />

			<DropdownMenu.Sub onOpenChange={handleMcpSubMenuOpen}>
				<DropdownMenu.SubTrigger class="flex cursor-pointer items-center gap-2">
					<McpLogo class="h-4 w-4" />

					<span>{m.chat_sidebar_mcp_servers()}</span>
				</DropdownMenu.SubTrigger>

				<DropdownMenu.SubContent class="w-72 pt-0">
					<DropdownMenuSearchable
						placeholder={m.mcp_servers_search_placeholder()}
						bind:searchValue={mcpSearchQuery}
						emptyMessage={hasMcpServers
							? m.mcp_servers_no_results()
							: m.mcp_servers_none_configured()}
						isEmpty={filteredMcpServers.length === 0}
					>
						<div class="max-h-64 overflow-y-auto">
							{#each filteredMcpServers as server (server.id)}
								{@const healthState = mcpStore.getHealthCheckState(server.id)}
								{@const hasError = healthState.status === HealthCheckStatus.ERROR}
								{@const isEnabledForChat = isServerEnabledForChat(server.id)}

								<button
									type="button"
									class="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-2 text-left transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
									onclick={() => !hasError && toggleServerForChat(server.id)}
									disabled={hasError}
								>
									<div class="flex min-w-0 flex-1 items-center gap-2">
										{#if mcpStore.getServerFavicon(server.id)}
											<img
												src={mcpStore.getServerFavicon(server.id)}
												alt=""
												class="h-4 w-4 shrink-0 rounded-sm"
												onerror={(e) => {
													(e.currentTarget as HTMLImageElement).style.display = 'none';
												}}
											/>
										{/if}

										<span class="truncate text-sm">{getServerLabel(server)}</span>

										{#if hasError}
											<span
												class="shrink-0 rounded bg-destructive/15 px-1.5 py-0.5 text-xs text-destructive"
											>
												{m.server_status_error()}
											</span>
										{/if}
									</div>

									<Switch
										checked={isEnabledForChat}
										disabled={hasError}
										onclick={(e: MouseEvent) => e.stopPropagation()}
										onCheckedChange={() => toggleServerForChat(server.id)}
									/>
								</button>
							{/each}
						</div>

						{#snippet footer()}
							<DropdownMenu.Item
								class="flex cursor-pointer items-center gap-2"
								onclick={handleMcpSettingsClick}
							>
								<Settings class="h-4 w-4" />

								<span>{m.mcp_servers_manage()}</span>
							</DropdownMenu.Item>
						{/snippet}
					</DropdownMenuSearchable>
				</DropdownMenu.SubContent>
			</DropdownMenu.Sub>

			{#if hasMcpPromptsSupport}
				<DropdownMenu.Item
					class="flex cursor-pointer items-center gap-2"
					onclick={handleMcpPromptClick}
				>
					<Zap class="h-4 w-4" />

					<span>{m.attachment_label_mcp_prompt()}</span>
				</DropdownMenu.Item>
			{/if}

			{#if hasMcpResourcesSupport}
				<DropdownMenu.Item
					class="flex cursor-pointer items-center gap-2"
					onclick={handleMcpResourcesClick}
				>
					<FolderOpen class="h-4 w-4" />

					<span>{m.mcp_resources_title()}</span>
				</DropdownMenu.Item>
			{/if}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
