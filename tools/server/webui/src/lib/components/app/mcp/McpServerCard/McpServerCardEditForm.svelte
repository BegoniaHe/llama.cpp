<script lang="ts">
	import { McpServerForm } from '$lib/components/app/mcp';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		serverId: string;
		serverUrl: string;
		serverUseProxy?: boolean;
		onSave: (url: string, headers: string, useProxy: boolean) => void;
		onCancel: () => void;
	}

	let { serverId, serverUrl, serverUseProxy = false, onSave, onCancel }: Props = $props();

	let editUrl = $derived(serverUrl);
	let editHeaders = $state('');
	let editUseProxy = $derived(serverUseProxy);

	let urlError = $derived.by(() => {
		if (!editUrl.trim()) return m.mcp_server_form_url_required();
		try {
			new URL(editUrl);
			return null;
		} catch {
			return m.mcp_server_form_url_invalid();
		}
	});

	let canSave = $derived(!urlError);

	function handleSave() {
		if (!canSave) return;
		onSave(editUrl.trim(), editHeaders.trim(), editUseProxy);
	}

	export function setInitialValues(url: string, headers: string, useProxy: boolean) {
		editUrl = url;
		editHeaders = headers;
		editUseProxy = useProxy;
	}
</script>

<div class="space-y-4">
	<p class="font-medium">{m.mcp_server_edit_configure_title()}</p>

	<McpServerForm
		url={editUrl}
		headers={editHeaders}
		useProxy={editUseProxy}
		onUrlChange={(v) => (editUrl = v)}
		onHeadersChange={(v) => (editHeaders = v)}
		onUseProxyChange={(v) => (editUseProxy = v)}
		urlError={editUrl ? urlError : null}
		id={serverId}
	/>

	<div class="flex items-center justify-end gap-2">
		<Button variant="secondary" size="sm" onclick={onCancel}>{m.chat_sidebar_cancel()}</Button>

		<Button size="sm" onclick={handleSave} disabled={!canSave}>
			{serverUrl.trim() ? m.mcp_server_edit_update() : m.mcp_servers_add_button()}
		</Button>
	</div>
</div>
