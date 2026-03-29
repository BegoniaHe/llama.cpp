<script lang="ts">
	import * as m from '$lib/paraglide/messages';

	interface Props {
		isLoading: boolean;
	}

	let { isLoading }: Props = $props();
</script>

<div class="py-4 text-center text-sm text-muted-foreground">
	{#if isLoading}
		{m.mcp_resource_browser_loading()}
	{:else}
		{m.mcp_resource_browser_empty()}
	{/if}
</div>
