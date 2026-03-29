<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { cn } from '$lib/components/ui/utils';
	import { m } from '$lib/paraglide/messages';
	import type { MCPConnectionLog } from '$lib/types';
	import { formatTime, getMcpLogLevelClass, getMcpLogLevelIcon } from '$lib/utils';
	import { ChevronDown, ChevronRight } from '@lucide/svelte';

	interface Props {
		logs: MCPConnectionLog[];
		connectionTimeMs?: number;
		defaultExpanded?: boolean;
		class?: string;
	}

	let { logs, connectionTimeMs, defaultExpanded = false, class: className }: Props = $props();

	let isExpanded = $derived(defaultExpanded);
</script>

{#if logs.length > 0}
	<Collapsible.Root bind:open={isExpanded} class={className}>
		<div class="space-y-2">
			<Collapsible.Trigger
				class="flex w-full items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
			>
				{#if isExpanded}
					<ChevronDown class="h-3.5 w-3.5" />
				{:else}
					<ChevronRight class="h-3.5 w-3.5" />
				{/if}

				<span>{m.mcp_connection_log_title({ count: String(logs.length) })}</span>

				{#if connectionTimeMs !== undefined}
					<span class="ml-1"
						>· {m.mcp_connection_log_connected_in({ ms: String(connectionTimeMs) })}</span
					>
				{/if}
			</Collapsible.Trigger>
		</div>

		<Collapsible.Content class="mt-2">
			<div
				class="max-h-64 space-y-0.5 overflow-y-auto rounded bg-muted/50 p-2 font-mono text-[10px]"
			>
				{#each logs as log (log.timestamp.getTime() + log.message)}
					{@const Icon = getMcpLogLevelIcon(log.level)}

					<div class={cn('flex items-start gap-1.5', getMcpLogLevelClass(log.level))}>
						<span class="shrink-0 text-muted-foreground">
							{formatTime(log.timestamp)}
						</span>

						<Icon class="mt-0.5 h-3 w-3 shrink-0" />

						<span class="break-all">{log.message}</span>
					</div>
				{/each}
			</div>
		</Collapsible.Content>
	</Collapsible.Root>
{/if}
