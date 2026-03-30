<script lang="ts">
	import { SearchInput } from '$lib/components/app';
	import { m } from '$lib/paraglide/messages';

	interface Props {
		value?: string;
		placeholder?: string;
		onInput?: (value: string) => void;
		class?: string;
	}

	let {
		value = $bindable(''),
		placeholder = m.chat_sidebar_search_input(),
		onInput,
		class: className
	}: Props = $props();
</script>

<SearchInput bind:value {placeholder} {onInput} class="mb-4 {className}" />
