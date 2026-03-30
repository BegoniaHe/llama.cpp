<script lang="ts">
	import { m } from '$lib/paraglide/messages';

	interface Props {
		class?: string;
		show?: boolean;
	}

	let { class: className = '', show = true }: Props = $props();
</script>

{#if show}
	<div class="mt-6 items-center justify-center {className} hidden md:flex">
		<p class="text-xs text-muted-foreground">
			{m.chat_form_helper_text_press()}
			<kbd class="rounded bg-muted px-1 py-0.5 font-mono text-xs">Enter</kbd>
			{m.chat_form_helper_text_to_send()}
			<kbd class="rounded bg-muted px-1 py-0.5 font-mono text-xs">Shift + Enter</kbd>
			{m.chat_form_helper_text_for_new_line()}
		</p>
	</div>
{/if}
