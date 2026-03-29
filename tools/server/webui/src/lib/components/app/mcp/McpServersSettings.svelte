<script lang="ts">
	import { McpServerCard, McpServerCardSkeleton, McpServerForm } from '$lib/components/app/mcp';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { MCP_SERVER_ID_PREFIX } from '$lib/constants';
	import { HealthCheckStatus } from '$lib/enums';
	import { m } from '$lib/paraglide/messages';
	import { conversationsStore } from '$lib/stores/conversations.svelte';
	import { mcpStore } from '$lib/stores/mcp.svelte';
	import { uuid } from '$lib/utils';
	import { Plus } from '@lucide/svelte';

	let servers = $derived(mcpStore.getServersSorted());

	let initialLoadComplete = $state(false);

	$effect(() => {
		if (initialLoadComplete) return;

		const allChecked =
			servers.length > 0 &&
			servers.every((server) => {
				const state = mcpStore.getHealthCheckState(server.id);

				return (
					state.status === HealthCheckStatus.SUCCESS || state.status === HealthCheckStatus.ERROR
				);
			});

		if (allChecked) {
			initialLoadComplete = true;
		}
	});

	let isAddingServer = $state(false);
	let newServerUrl = $state('');
	let newServerHeaders = $state('');
	let newServerUrlError = $derived.by(() => {
		if (!newServerUrl.trim()) return m.mcp_server_form_url_required();
		try {
			new URL(newServerUrl);

			return null;
		} catch {
			return m.mcp_server_form_url_invalid();
		}
	});

	function showAddServerForm() {
		isAddingServer = true;
		newServerUrl = '';
		newServerHeaders = '';
	}

	function cancelAddServer() {
		isAddingServer = false;
		newServerUrl = '';
		newServerHeaders = '';
	}

	function saveNewServer() {
		if (newServerUrlError) return;

		const newServerId = uuid() ?? `${MCP_SERVER_ID_PREFIX}-${Date.now()}`;

		mcpStore.addServer({
			id: newServerId,
			enabled: true,
			url: newServerUrl.trim(),
			headers: newServerHeaders.trim() || undefined
		});

		conversationsStore.setMcpServerOverride(newServerId, true);

		isAddingServer = false;
		newServerUrl = '';
		newServerHeaders = '';
	}
</script>

<div class="space-y-5 md:space-y-4">
	<div class="flex items-start justify-between gap-4">
		<div>
			<h4 class="text-base font-semibold">{m.mcp_servers_manage_title()}</h4>
		</div>

		{#if !isAddingServer}
			<Button variant="outline" size="sm" class="shrink-0" onclick={showAddServerForm}>
				<Plus class="h-4 w-4" />

				{m.mcp_servers_add_new_title()}
			</Button>
		{/if}
	</div>

	{#if isAddingServer}
		<Card.Root class="bg-muted/30 p-4">
			<div class="space-y-4">
				<p class="font-medium">{m.mcp_servers_add_new_title()}</p>

				<McpServerForm
					url={newServerUrl}
					headers={newServerHeaders}
					onUrlChange={(v) => (newServerUrl = v)}
					onHeadersChange={(v) => (newServerHeaders = v)}
					urlError={newServerUrl ? newServerUrlError : null}
					id="new-server"
				/>

				<div class="flex items-center justify-end gap-2">
					<Button variant="secondary" size="sm" onclick={cancelAddServer}
						>{m.chat_sidebar_cancel()}</Button
					>

					<Button
						variant="default"
						size="sm"
						onclick={saveNewServer}
						disabled={!!newServerUrlError}
						aria-label={m.mcp_servers_add_button()}
					>
						{m.mcp_servers_add_button()}
					</Button>
				</div>
			</div>
		</Card.Root>
	{/if}

	{#if servers.length === 0 && !isAddingServer}
		<div class="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
			{m.mcp_servers_empty_state()}
		</div>
	{/if}

	{#if servers.length > 0}
		<div class="space-y-3">
			{#each servers as server (server.id)}
				{#if !initialLoadComplete}
					<McpServerCardSkeleton />
				{:else}
					<McpServerCard
						{server}
						faviconUrl={mcpStore.getServerFavicon(server.id)}
						enabled={conversationsStore.isMcpServerEnabledForChat(server.id)}
						onToggle={async () => await conversationsStore.toggleMcpServerForChat(server.id)}
						onUpdate={(updates) => mcpStore.updateServer(server.id, updates)}
						onDelete={() => mcpStore.removeServer(server.id)}
					/>
				{/if}
			{/each}
		</div>
	{/if}
</div>
