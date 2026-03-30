<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { m } from '$lib/paraglide/messages';
	import { Mic, Square } from '@lucide/svelte';

	interface Props {
		class?: string;
		disabled?: boolean;
		hasAudioModality?: boolean;
		isLoading?: boolean;
		isRecording?: boolean;
		onMicClick?: () => void;
	}

	let {
		class: className = '',
		disabled = false,
		hasAudioModality = false,
		isLoading = false,
		isRecording = false,
		onMicClick
	}: Props = $props();
</script>

<div class="flex items-center gap-1 {className}">
	<Tooltip.Root>
		<Tooltip.Trigger>
			<Button
				class="h-8 w-8 rounded-full p-0 {isRecording
					? 'animate-pulse bg-red-500 text-white hover:bg-red-600'
					: ''}"
				disabled={disabled || isLoading || !hasAudioModality}
				onclick={onMicClick}
				type="button"
			>
				<span class="sr-only"
					>{isRecording ? m.chat_form_record_stop() : m.chat_form_record_start()}</span
				>

				{#if isRecording}
					<Square class="h-4 w-4 animate-pulse fill-white" />
				{:else}
					<Mic class="h-4 w-4" />
				{/if}
			</Button>
		</Tooltip.Trigger>

		{#if !hasAudioModality}
			<Tooltip.Content>
				<p>{m.chat_form_record_audio_unsupported()}</p>
			</Tooltip.Content>
		{/if}
	</Tooltip.Root>
</div>
