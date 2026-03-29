<script lang="ts">
	import { SearchInput } from '$lib/components/app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';
	import { Loader2, RefreshCw } from '@lucide/svelte';

	interface Props {
		isLoading: boolean;
		onRefresh: () => void;
		onSearch?: (query: string) => void;
		searchQuery?: string;
	}

	let { isLoading, onRefresh, onSearch, searchQuery = '' }: Props = $props();
</script>

<div class="flex flex-col gap-2">
	<div class="mb-2 flex items-center gap-4">
		<SearchInput
			placeholder={m.mcp_resource_browser_search_placeholder()}
			value={searchQuery}
			onInput={(value) => onSearch?.(value)}
		/>

		<Button
			variant="ghost"
			size="sm"
			class="h-8 w-8 p-0"
			onclick={onRefresh}
			disabled={isLoading}
			title={m.mcp_resource_browser_refresh_title()}
		>
			{#if isLoading}
				<Loader2 class="h-4 w-4 animate-spin" />
			{:else}
				<RefreshCw class="h-4 w-4" />
			{/if}
		</Button>
	</div>

	<h3 class="text-sm font-medium">{m.mcp_resource_browser_available_title()}</h3>
</div>
