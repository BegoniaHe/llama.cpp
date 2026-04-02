<script lang="ts">
	import { BadgeChatStatistic } from '$lib/components/app';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { DEFAULT_PERFORMANCE_TIME, MS_PER_SECOND } from '$lib/constants';
	import { ChatMessageStatsView } from '$lib/enums';
	import { m } from '$lib/paraglide/messages';
	import type { ChatMessageAgenticTimings } from '$lib/types/chat';
	import { formatPerformanceTime } from '$lib/utils';
	import { BookOpenText, Clock, Gauge, Layers, Sparkles, WholeWord, Wrench } from '@lucide/svelte';

	interface Props {
		predictedTokens?: number;
		predictedMs?: number;
		promptTokens?: number;
		promptMs?: number;
		isLive?: boolean;
		isProcessingPrompt?: boolean;
		initialView?: ChatMessageStatsView;
		agenticTimings?: ChatMessageAgenticTimings;
		onActiveViewChange?: (view: ChatMessageStatsView) => void;
		hideSummary?: boolean;
	}

	let {
		predictedTokens,
		predictedMs,
		promptTokens,
		promptMs,
		isLive = false,
		isProcessingPrompt = false,
		initialView = ChatMessageStatsView.GENERATION,
		agenticTimings,
		onActiveViewChange,
		hideSummary = false
	}: Props = $props();

	let activeView: ChatMessageStatsView = $derived(initialView);
	let hasAutoSwitchedToGeneration = $state(false);

	$effect(() => {
		onActiveViewChange?.(activeView);
	});

	// In live mode: auto-switch to GENERATION tab when prompt processing completes
	$effect(() => {
		if (isLive) {
			// Auto-switch to generation tab only when prompt processing is done (once)
			if (
				!hasAutoSwitchedToGeneration &&
				!isProcessingPrompt &&
				predictedTokens &&
				predictedTokens > 0
			) {
				activeView = ChatMessageStatsView.GENERATION;
				hasAutoSwitchedToGeneration = true;
			} else if (!hasAutoSwitchedToGeneration) {
				// Stay on READING while prompt is still being processed
				activeView = ChatMessageStatsView.READING;
			}
		}
	});

	let hasGenerationStats = $derived(
		predictedTokens !== undefined &&
			predictedTokens > 0 &&
			predictedMs !== undefined &&
			predictedMs > 0
	);

	let tokensPerSecond = $derived(
		hasGenerationStats ? (predictedTokens! / predictedMs!) * MS_PER_SECOND : 0
	);
	let formattedTime = $derived(
		predictedMs !== undefined ? formatPerformanceTime(predictedMs) : DEFAULT_PERFORMANCE_TIME
	);

	let promptTokensPerSecond = $derived(
		promptTokens !== undefined && promptMs !== undefined && promptMs > 0
			? (promptTokens / promptMs) * MS_PER_SECOND
			: undefined
	);

	let formattedPromptTime = $derived(
		promptMs !== undefined ? formatPerformanceTime(promptMs) : undefined
	);

	let hasPromptStats = $derived(
		promptTokens !== undefined &&
			promptMs !== undefined &&
			promptTokensPerSecond !== undefined &&
			formattedPromptTime !== undefined
	);

	// In live mode, generation tab is disabled until we have generation stats
	let isGenerationDisabled = $derived(isLive && !hasGenerationStats);

	let hasAgenticStats = $derived(agenticTimings !== undefined && agenticTimings.toolCallsCount > 0);

	let agenticToolsPerSecond = $derived(
		hasAgenticStats && agenticTimings!.toolsMs > 0
			? (agenticTimings!.toolCallsCount / agenticTimings!.toolsMs) * MS_PER_SECOND
			: 0
	);

	let formattedAgenticToolsTime = $derived(
		hasAgenticStats ? formatPerformanceTime(agenticTimings!.toolsMs) : DEFAULT_PERFORMANCE_TIME
	);

	let agenticTotalTimeMs = $derived(
		hasAgenticStats
			? agenticTimings!.toolsMs + agenticTimings!.llm.predicted_ms + agenticTimings!.llm.prompt_ms
			: 0
	);

	let formattedAgenticTotalTime = $derived(formatPerformanceTime(agenticTotalTimeMs));
</script>

<div class="inline-flex items-center text-xs text-muted-foreground">
	<div class="inline-flex items-center rounded-sm bg-muted-foreground/15 p-0.5">
		{#if hasPromptStats || isLive}
			<Tooltip.Root>
				<Tooltip.Trigger>
					<button
						type="button"
						class="inline-flex h-5 w-5 items-center justify-center rounded-sm transition-colors {activeView ===
						ChatMessageStatsView.READING
							? 'bg-background text-foreground shadow-sm'
							: 'hover:text-foreground'}"
						onclick={() => (activeView = ChatMessageStatsView.READING)}
					>
						<BookOpenText class="h-3 w-3" />

						<span class="sr-only">{m.chat_message_stats_reading_sr()}</span>
					</button>
				</Tooltip.Trigger>

				<Tooltip.Content>
					<p>{m.chat_message_stats_reading_tooltip()}</p>
				</Tooltip.Content>
			</Tooltip.Root>
		{/if}
		<Tooltip.Root>
			<Tooltip.Trigger>
				<button
					type="button"
					class="inline-flex h-5 w-5 items-center justify-center rounded-sm transition-colors {activeView ===
					ChatMessageStatsView.GENERATION
						? 'bg-background text-foreground shadow-sm'
						: isGenerationDisabled
							? 'cursor-not-allowed opacity-40'
							: 'hover:text-foreground'}"
					onclick={() => !isGenerationDisabled && (activeView = ChatMessageStatsView.GENERATION)}
					disabled={isGenerationDisabled}
				>
					<Sparkles class="h-3 w-3" />

					<span class="sr-only">{m.chat_message_stats_generation_sr()}</span>
				</button>
			</Tooltip.Trigger>

			<Tooltip.Content>
				<p>
					{isGenerationDisabled
						? m.chat_message_stats_generation_waiting_tooltip()
						: m.chat_message_stats_generation_tooltip()}
				</p>
			</Tooltip.Content>
		</Tooltip.Root>

		{#if hasAgenticStats}
			<Tooltip.Root>
				<Tooltip.Trigger>
					<button
						type="button"
						class="inline-flex h-5 w-5 items-center justify-center rounded-sm transition-colors {activeView ===
						ChatMessageStatsView.TOOLS
							? 'bg-background text-foreground shadow-sm'
							: 'hover:text-foreground'}"
						onclick={() => (activeView = ChatMessageStatsView.TOOLS)}
					>
						<Wrench class="h-3 w-3" />

						<span class="sr-only">{m.chat_message_stats_tools_sr()}</span>
					</button>
				</Tooltip.Trigger>

				<Tooltip.Content>
					<p>{m.chat_message_stats_tools_tooltip()}</p>
				</Tooltip.Content>
			</Tooltip.Root>

			{#if !hideSummary}
				<Tooltip.Root>
					<Tooltip.Trigger>
						<button
							type="button"
							class="inline-flex h-5 w-5 items-center justify-center rounded-sm transition-colors {activeView ===
							ChatMessageStatsView.SUMMARY
								? 'bg-background text-foreground shadow-sm'
								: 'hover:text-foreground'}"
							onclick={() => (activeView = ChatMessageStatsView.SUMMARY)}
						>
							<Layers class="h-3 w-3" />

							<span class="sr-only">{m.chat_message_stats_summary_sr()}</span>
						</button>
					</Tooltip.Trigger>

					<Tooltip.Content>
						<p>{m.chat_message_stats_summary_tooltip()}</p>
					</Tooltip.Content>
				</Tooltip.Root>
			{/if}
		{/if}
	</div>

	<div class="flex items-center gap-1 px-2">
		{#if activeView === ChatMessageStatsView.GENERATION && hasGenerationStats}
			<BadgeChatStatistic
				class="bg-transparent"
				icon={WholeWord}
				value={m.chat_message_stats_tokens_value({
					count: predictedTokens?.toLocaleString() ?? '0'
				})}
				tooltipLabel={m.chat_message_stats_generated_tokens()}
			/>

			<BadgeChatStatistic
				class="bg-transparent"
				icon={Clock}
				value={formattedTime}
				tooltipLabel={m.chat_message_stats_generation_time()}
			/>

			<BadgeChatStatistic
				class="bg-transparent"
				icon={Gauge}
				value={m.chat_message_stats_tokens_per_second_value({ value: tokensPerSecond.toFixed(2) })}
				tooltipLabel={m.chat_message_stats_generation_speed()}
			/>
		{:else if activeView === ChatMessageStatsView.TOOLS && hasAgenticStats}
			<BadgeChatStatistic
				class="bg-transparent"
				icon={Wrench}
				value={m.chat_message_stats_tool_calls_value({
					count: String(agenticTimings!.toolCallsCount)
				})}
				tooltipLabel={m.chat_message_stats_tool_calls_executed()}
			/>

			<BadgeChatStatistic
				class="bg-transparent"
				icon={Clock}
				value={formattedAgenticToolsTime}
				tooltipLabel={m.chat_message_stats_tool_execution_time()}
			/>

			<BadgeChatStatistic
				class="bg-transparent"
				icon={Gauge}
				value={m.chat_message_stats_calls_per_second_value({
					value: agenticToolsPerSecond.toFixed(2)
				})}
				tooltipLabel={m.chat_message_stats_tool_execution_rate()}
			/>
		{:else if activeView === ChatMessageStatsView.SUMMARY && hasAgenticStats}
			<BadgeChatStatistic
				class="bg-transparent"
				icon={Layers}
				value={m.chat_message_stats_turns_value({ count: String(agenticTimings!.turns) })}
				tooltipLabel={m.chat_message_stats_agentic_turns()}
			/>

			<BadgeChatStatistic
				class="bg-transparent"
				icon={WholeWord}
				value={m.chat_message_stats_tokens_value({
					count: agenticTimings!.llm.predicted_n.toLocaleString()
				})}
				tooltipLabel={m.chat_message_stats_total_tokens_generated()}
			/>

			<BadgeChatStatistic
				class="bg-transparent"
				icon={Clock}
				value={formattedAgenticTotalTime}
				tooltipLabel={m.chat_message_stats_total_time()}
			/>
		{:else if hasPromptStats}
			<BadgeChatStatistic
				class="bg-transparent"
				icon={WholeWord}
				value={m.chat_message_stats_tokens_value({ count: promptTokens?.toLocaleString() ?? '0' })}
				tooltipLabel={m.chat_message_stats_prompt_tokens()}
			/>

			<BadgeChatStatistic
				class="bg-transparent"
				icon={Clock}
				value={formattedPromptTime ?? m.chat_message_stats_zero_seconds()}
				tooltipLabel={m.chat_message_stats_prompt_processing_time()}
			/>

			<BadgeChatStatistic
				class="bg-transparent"
				icon={Gauge}
				value={m.chat_message_stats_tokens_per_second_value({
					value: promptTokensPerSecond!.toFixed(2)
				})}
				tooltipLabel={m.chat_message_stats_prompt_processing_speed()}
			/>
		{/if}
	</div>
</div>
