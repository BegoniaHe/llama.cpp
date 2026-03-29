<script lang="ts">
	import { ActionIconCopyToClipboard, BadgeInfo } from '$lib/components/app';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as m from '$lib/paraglide/messages';
	import { modelsStore } from '$lib/stores/models.svelte';
	import { serverStore } from '$lib/stores/server.svelte';
	import { Package } from '@lucide/svelte';
	import ModelId from './ModelId.svelte';

	interface Props {
		class?: string;
		model?: string;
		onclick?: () => void;
		showCopyIcon?: boolean;
		showTooltip?: boolean;
	}

	let {
		class: className = '',
		model: modelProp,
		onclick,
		showCopyIcon = false,
		showTooltip = false
	}: Props = $props();

	let model = $derived(modelProp || modelsStore.singleModelName);
	let isModelMode = $derived(serverStore.isModelMode);
	let shouldShow = $derived(model && (modelProp !== undefined || isModelMode));
</script>

{#snippet badgeContent()}
	<BadgeInfo class={className} {onclick}>
		{#snippet icon()}
			<Package class="h-3 w-3" />
		{/snippet}

		{#if model}
			<ModelId modelId={model} />
		{/if}

		{#if showCopyIcon}
			<ActionIconCopyToClipboard text={model || ''} ariaLabel={m.model_badge_copy_model_name()} />
		{/if}
	</BadgeInfo>
{/snippet}

{#if shouldShow}
	{#if showTooltip}
		<Tooltip.Root>
			<Tooltip.Trigger>
				{@render badgeContent()}
			</Tooltip.Trigger>

			<Tooltip.Content>
				{onclick ? m.model_badge_click_for_details() : model}
			</Tooltip.Content>
		</Tooltip.Root>
	{:else}
		{@render badgeContent()}
	{/if}
{/if}
