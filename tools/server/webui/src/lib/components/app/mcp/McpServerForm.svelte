<script lang="ts">
	import { KeyValuePairs } from '$lib/components/app';
	import { Input } from '$lib/components/ui/input';
	import { Switch } from '$lib/components/ui/switch';
	import { MCP_SERVER_URL_PLACEHOLDER } from '$lib/constants';
	import { UrlProtocol } from '$lib/enums';
	import { m } from '$lib/paraglide/messages';
	import { mcpStore } from '$lib/stores/mcp.svelte';
	import type { KeyValuePair } from '$lib/types';
	import { parseHeadersToArray, serializeHeaders } from '$lib/utils';

	interface Props {
		url: string;
		headers: string;
		useProxy?: boolean;
		onUrlChange: (url: string) => void;
		onHeadersChange: (headers: string) => void;
		onUseProxyChange?: (useProxy: boolean) => void;
		urlError?: string | null;
		id?: string;
	}

	let {
		url,
		headers,
		useProxy = false,
		onUrlChange,
		onHeadersChange,
		onUseProxyChange,
		urlError = null,
		id = 'server'
	}: Props = $props();

	let isWebSocket = $derived(
		url.toLowerCase().startsWith(UrlProtocol.WEBSOCKET) ||
			url.toLowerCase().startsWith(UrlProtocol.WEBSOCKET_SECURE)
	);

	let headerPairs = $derived<KeyValuePair[]>(parseHeadersToArray(headers));

	function updateHeaderPairs(newPairs: KeyValuePair[]) {
		headerPairs = newPairs;
		onHeadersChange(serializeHeaders(newPairs));
	}
</script>

<div class="grid gap-3">
	<div>
		<label for="server-url-{id}" class="mb-2 block text-xs font-medium">
			{m.mcp_server_form_url_label()} <span class="text-destructive">*</span>
		</label>

		<Input
			id="server-url-{id}"
			type="url"
			placeholder={MCP_SERVER_URL_PLACEHOLDER}
			value={url}
			oninput={(e) => onUrlChange(e.currentTarget.value)}
			class={urlError ? 'border-destructive' : ''}
		/>

		{#if urlError}
			<p class="mt-1.5 text-xs text-destructive">{urlError}</p>
		{/if}

		{#if !isWebSocket && onUseProxyChange}
			<label
				class="mt-3 flex items-start gap-2"
				class:cursor-pointer={mcpStore.isProxyAvailable}
				class:opacity-80={!mcpStore.isProxyAvailable}
			>
				<Switch
					class="mt-1"
					id="use-proxy-{id}"
					checked={useProxy}
					disabled={!mcpStore.isProxyAvailable}
					onCheckedChange={(checked) => onUseProxyChange?.(checked)}
				/>

				<span>
					<span class="text-xs text-muted-foreground">{m.mcp_server_form_use_proxy()}</span>

					<br />

					{#if !mcpStore.isProxyAvailable}
						<span class="inline-flex gap-0.75 text-xs text-muted-foreground/60"
							>({m.mcp_server_form_proxy_hint_prefix()}
							<pre>llama-server</pre>
							{m.mcp_server_form_proxy_hint_with()}
							<pre>--webui-mcp-proxy</pre>
							{m.mcp_server_form_proxy_hint_suffix()})</span
						>
					{/if}
				</span>
			</label>
		{/if}
	</div>

	<KeyValuePairs
		class="mt-2"
		pairs={headerPairs}
		onPairsChange={updateHeaderPairs}
		keyPlaceholder={m.mcp_server_form_header_name_placeholder()}
		valuePlaceholder={m.mcp_server_form_header_value_placeholder()}
		addButtonLabel={m.mcp_servers_add_button()}
		emptyMessage={m.mcp_server_form_headers_empty()}
		sectionLabel={m.mcp_server_form_headers_label()}
		sectionLabelOptional
	/>
</div>
