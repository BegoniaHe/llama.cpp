<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as m from '$lib/paraglide/messages';
	import { Pencil, RefreshCw, Trash2 } from '@lucide/svelte';

	interface Props {
		isHealthChecking: boolean;
		onEdit: () => void;
		onRefresh: () => void;
		onDelete: () => void;
	}

	let { isHealthChecking, onEdit, onRefresh, onDelete }: Props = $props();
</script>

<div class="flex shrink-0 items-center gap-1">
	<Button variant="ghost" size="icon" class="h-7 w-7" onclick={onEdit} aria-label={m.chat_sidebar_edit_action()}>
		<Pencil class="h-3.5 w-3.5" />
	</Button>

	<Button
		variant="ghost"
		size="icon"
		class="h-7 w-7"
		onclick={onRefresh}
		disabled={isHealthChecking}
		aria-label={m.mcp_server_refresh_action()}
	>
		<RefreshCw class="h-3.5 w-3.5" />
	</Button>

	<Button
		variant="ghost"
		size="icon"
		class="hover:text-destructive-foreground h-7 w-7 text-destructive hover:bg-destructive/10"
		onclick={onDelete}
		aria-label={m.chat_sidebar_delete()}
	>
		<Trash2 class="h-3.5 w-3.5" />
	</Button>
</div>
