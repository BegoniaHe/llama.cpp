<script lang="ts">
	import {
		ChatSettingsFields,
		ChatSettingsFooter,
		ChatSettingsImportExportTab,
		McpLogo,
		McpServersSettings
	} from '$lib/components/app';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import {
		NUMERIC_FIELDS,
		POSITIVE_INTEGER_FIELDS,
		SETTINGS_KEYS,
		SETTINGS_SECTION_TITLES,
		type SettingsSectionTitle
	} from '$lib/constants';
	import { SettingsFieldType } from '$lib/enums/settings';
	import { ColorMode } from '$lib/enums/ui';
	import { getLanguageOptions } from '$lib/i18n/runtime';
	import { m } from '$lib/paraglide/messages';
	import { config, settingsStore } from '$lib/stores/settings.svelte';
	import {
		AlertTriangle,
		ChevronLeft,
		ChevronRight,
		Code,
		Database,
		Funnel,
		Monitor,
		Moon,
		Settings,
		Sun
	} from '@lucide/svelte';
	import { setMode } from 'mode-watcher';
	import type { Component } from 'svelte';

	interface Props {
		onSave?: () => void;
		initialSection?: SettingsSectionTitle;
	}

	let { onSave, initialSection }: Props = $props();
	const languageOptions = getLanguageOptions();
	const themeOptions = [
		{ value: ColorMode.SYSTEM, label: m.settings_theme_system(), icon: Monitor },
		{ value: ColorMode.LIGHT, label: m.settings_theme_light(), icon: Sun },
		{ value: ColorMode.DARK, label: m.settings_theme_dark(), icon: Moon }
	];

	function getSectionLabel(title: SettingsSectionTitle): string {
		switch (title) {
			case SETTINGS_SECTION_TITLES.GENERAL:
				return m.settings_section_general();
			case SETTINGS_SECTION_TITLES.DISPLAY:
				return m.settings_section_display();
			case SETTINGS_SECTION_TITLES.SAMPLING:
				return m.settings_section_sampling();
			case SETTINGS_SECTION_TITLES.PENALTIES:
				return m.settings_section_penalties();
			case SETTINGS_SECTION_TITLES.IMPORT_EXPORT:
				return m.settings_section_import_export();
			case SETTINGS_SECTION_TITLES.MCP:
				return m.settings_section_mcp();
			case SETTINGS_SECTION_TITLES.DEVELOPER:
				return m.settings_section_developer();
		}
	}

	function getFieldLabel(key: string): string {
		const labels: Record<string, string> = {
			[SETTINGS_KEYS.THEME]: m.settings_field_theme_label(),
			[SETTINGS_KEYS.LANGUAGE]: m.settings_field_language_label(),
			[SETTINGS_KEYS.API_KEY]: m.settings_field_api_key_label(),
			[SETTINGS_KEYS.SYSTEM_MESSAGE]: m.settings_field_system_message_label(),
			[SETTINGS_KEYS.PASTE_LONG_TEXT_TO_FILE_LEN]: m.settings_field_paste_long_text_to_file_length_label(),
			[SETTINGS_KEYS.COPY_TEXT_ATTACHMENTS_AS_PLAIN_TEXT]: m.settings_field_copy_text_attachments_as_plain_text_label(),
			[SETTINGS_KEYS.ENABLE_CONTINUE_GENERATION]: m.settings_field_enable_continue_button_label(),
			[SETTINGS_KEYS.PDF_AS_IMAGE]: m.settings_field_parse_pdf_as_image_label(),
			[SETTINGS_KEYS.ASK_FOR_TITLE_CONFIRMATION]: m.settings_field_ask_for_title_confirmation_label(),
			[SETTINGS_KEYS.SHOW_MESSAGE_STATS]: m.settings_field_show_message_generation_statistics_label(),
			[SETTINGS_KEYS.SHOW_THOUGHT_IN_PROGRESS]: m.settings_field_show_thought_in_progress_label(),
			[SETTINGS_KEYS.KEEP_STATS_VISIBLE]: m.settings_field_keep_stats_visible_label(),
			[SETTINGS_KEYS.AUTO_MIC_ON_EMPTY]: m.settings_field_show_microphone_on_empty_input_label(),
			[SETTINGS_KEYS.RENDER_USER_CONTENT_AS_MARKDOWN]: m.settings_field_render_user_content_as_markdown_label(),
			[SETTINGS_KEYS.FULL_HEIGHT_CODE_BLOCKS]: m.settings_field_use_full_height_code_blocks_label(),
			[SETTINGS_KEYS.DISABLE_AUTO_SCROLL]: m.settings_field_disable_automatic_scroll_label(),
			[SETTINGS_KEYS.ALWAYS_SHOW_SIDEBAR_ON_DESKTOP]: m.settings_field_always_show_sidebar_on_desktop_label(),
			[SETTINGS_KEYS.AUTO_SHOW_SIDEBAR_ON_NEW_CHAT]: m.settings_field_auto_show_sidebar_on_new_chat_label(),
			[SETTINGS_KEYS.SHOW_RAW_MODEL_NAMES]: m.settings_field_show_raw_model_names_label(),
			[SETTINGS_KEYS.TEMPERATURE]: m.settings_field_temperature_label(),
			[SETTINGS_KEYS.DYNATEMP_RANGE]: m.settings_field_dynamic_temperature_range_label(),
			[SETTINGS_KEYS.DYNATEMP_EXPONENT]: m.settings_field_dynamic_temperature_exponent_label(),
			[SETTINGS_KEYS.TOP_K]: m.settings_field_top_k_label(),
			[SETTINGS_KEYS.TOP_P]: m.settings_field_top_p_label(),
			[SETTINGS_KEYS.MIN_P]: m.settings_field_min_p_label(),
			[SETTINGS_KEYS.XTC_PROBABILITY]: m.settings_field_xtc_probability_label(),
			[SETTINGS_KEYS.XTC_THRESHOLD]: m.settings_field_xtc_threshold_label(),
			[SETTINGS_KEYS.TYP_P]: m.settings_field_typical_p_label(),
			[SETTINGS_KEYS.MAX_TOKENS]: m.settings_field_max_tokens_label(),
			[SETTINGS_KEYS.SAMPLERS]: m.settings_field_samplers_label(),
			[SETTINGS_KEYS.BACKEND_SAMPLING]: m.settings_field_backend_sampling_label(),
			[SETTINGS_KEYS.REPEAT_LAST_N]: m.settings_field_repeat_last_n_label(),
			[SETTINGS_KEYS.REPEAT_PENALTY]: m.settings_field_repeat_penalty_label(),
			[SETTINGS_KEYS.PRESENCE_PENALTY]: m.settings_field_presence_penalty_label(),
			[SETTINGS_KEYS.FREQUENCY_PENALTY]: m.settings_field_frequency_penalty_label(),
			[SETTINGS_KEYS.DRY_MULTIPLIER]: m.settings_field_dry_multiplier_label(),
			[SETTINGS_KEYS.DRY_BASE]: m.settings_field_dry_base_label(),
			[SETTINGS_KEYS.DRY_ALLOWED_LENGTH]: m.settings_field_dry_allowed_length_label(),
			[SETTINGS_KEYS.DRY_PENALTY_LAST_N]: m.settings_field_dry_penalty_last_n_label(),
			[SETTINGS_KEYS.AGENTIC_MAX_TURNS]: m.settings_field_agentic_loop_max_turns_label(),
			[SETTINGS_KEYS.ALWAYS_SHOW_AGENTIC_TURNS]: m.settings_field_always_show_agentic_turns_label(),
			[SETTINGS_KEYS.AGENTIC_MAX_TOOL_PREVIEW_LINES]: m.settings_field_max_lines_per_tool_preview_label(),
			[SETTINGS_KEYS.SHOW_TOOL_CALL_IN_PROGRESS]: m.settings_field_show_tool_call_in_progress_label(),
			[SETTINGS_KEYS.DISABLE_REASONING_PARSING]: m.settings_field_disable_reasoning_content_parsing_label(),
			[SETTINGS_KEYS.SHOW_RAW_OUTPUT_SWITCH]: m.settings_field_enable_raw_output_toggle_label(),
			[SETTINGS_KEYS.CUSTOM]: m.settings_field_custom_json_label()
		};

		return labels[key] ?? key;
	}

	function getFieldHelp(key: string): string | undefined {
		const helps: Record<string, string> = {
			[SETTINGS_KEYS.API_KEY]: m.settings_help_api_key(),
			[SETTINGS_KEYS.SYSTEM_MESSAGE]: m.settings_help_system_message(),
			[SETTINGS_KEYS.THEME]: m.settings_help_theme(),
			[SETTINGS_KEYS.LANGUAGE]: m.settings_help_language(),
			[SETTINGS_KEYS.PASTE_LONG_TEXT_TO_FILE_LEN]: m.settings_help_paste_long_text_to_file_length(),
			[SETTINGS_KEYS.COPY_TEXT_ATTACHMENTS_AS_PLAIN_TEXT]: m.settings_help_copy_text_attachments_as_plain_text(),
			[SETTINGS_KEYS.SAMPLERS]: m.settings_help_samplers(),
			[SETTINGS_KEYS.BACKEND_SAMPLING]: m.settings_help_backend_sampling(),
			[SETTINGS_KEYS.TEMPERATURE]: m.settings_help_temperature(),
			[SETTINGS_KEYS.DYNATEMP_RANGE]: m.settings_help_dynamic_temperature_range(),
			[SETTINGS_KEYS.DYNATEMP_EXPONENT]: m.settings_help_dynamic_temperature_exponent(),
			[SETTINGS_KEYS.TOP_K]: m.settings_help_top_k(),
			[SETTINGS_KEYS.TOP_P]: m.settings_help_top_p(),
			[SETTINGS_KEYS.MIN_P]: m.settings_help_min_p(),
			[SETTINGS_KEYS.XTC_PROBABILITY]: m.settings_help_xtc_probability(),
			[SETTINGS_KEYS.XTC_THRESHOLD]: m.settings_help_xtc_threshold(),
			[SETTINGS_KEYS.TYP_P]: m.settings_help_typical_p(),
			[SETTINGS_KEYS.REPEAT_LAST_N]: m.settings_help_repeat_last_n(),
			[SETTINGS_KEYS.REPEAT_PENALTY]: m.settings_help_repeat_penalty(),
			[SETTINGS_KEYS.PRESENCE_PENALTY]: m.settings_help_presence_penalty(),
			[SETTINGS_KEYS.FREQUENCY_PENALTY]: m.settings_help_frequency_penalty(),
			[SETTINGS_KEYS.DRY_MULTIPLIER]: m.settings_help_dry_multiplier(),
			[SETTINGS_KEYS.DRY_BASE]: m.settings_help_dry_base(),
			[SETTINGS_KEYS.DRY_ALLOWED_LENGTH]: m.settings_help_dry_allowed_length(),
			[SETTINGS_KEYS.DRY_PENALTY_LAST_N]: m.settings_help_dry_penalty_last_n(),
			[SETTINGS_KEYS.MAX_TOKENS]: m.settings_help_max_tokens(),
			[SETTINGS_KEYS.CUSTOM]: m.settings_help_custom_json(),
			[SETTINGS_KEYS.SHOW_THOUGHT_IN_PROGRESS]: m.settings_help_show_thought_in_progress(),
			[SETTINGS_KEYS.DISABLE_REASONING_PARSING]: m.settings_help_disable_reasoning_content_parsing(),
			[SETTINGS_KEYS.SHOW_RAW_OUTPUT_SWITCH]: m.settings_help_enable_raw_output_toggle(),
			[SETTINGS_KEYS.KEEP_STATS_VISIBLE]: m.settings_help_keep_stats_visible(),
			[SETTINGS_KEYS.SHOW_MESSAGE_STATS]: m.settings_help_show_message_generation_statistics(),
			[SETTINGS_KEYS.ASK_FOR_TITLE_CONFIRMATION]: m.settings_help_ask_for_title_confirmation(),
			[SETTINGS_KEYS.PDF_AS_IMAGE]: m.settings_help_parse_pdf_as_image(),
			[SETTINGS_KEYS.DISABLE_AUTO_SCROLL]: m.settings_help_disable_automatic_scroll(),
			[SETTINGS_KEYS.RENDER_USER_CONTENT_AS_MARKDOWN]: m.settings_help_render_user_content_as_markdown(),
			[SETTINGS_KEYS.ALWAYS_SHOW_SIDEBAR_ON_DESKTOP]: m.settings_help_always_show_sidebar_on_desktop(),
			[SETTINGS_KEYS.AUTO_SHOW_SIDEBAR_ON_NEW_CHAT]: m.settings_help_auto_show_sidebar_on_new_chat(),
			[SETTINGS_KEYS.AUTO_MIC_ON_EMPTY]: m.settings_help_show_microphone_on_empty_input(),
			[SETTINGS_KEYS.FULL_HEIGHT_CODE_BLOCKS]: m.settings_help_use_full_height_code_blocks(),
			[SETTINGS_KEYS.SHOW_RAW_MODEL_NAMES]: m.settings_help_show_raw_model_names(),
			[SETTINGS_KEYS.AGENTIC_MAX_TURNS]: m.settings_help_agentic_loop_max_turns(),
			[SETTINGS_KEYS.AGENTIC_MAX_TOOL_PREVIEW_LINES]: m.settings_help_max_lines_per_tool_preview(),
			[SETTINGS_KEYS.SHOW_TOOL_CALL_IN_PROGRESS]: m.settings_help_show_tool_call_in_progress(),
			[SETTINGS_KEYS.ENABLE_CONTINUE_GENERATION]: m.settings_help_enable_continue_button()
		};

		return helps[key];
	}

	function createField(
		key: string,
		type: SettingsFieldType,
		extras: Partial<SettingsFieldConfig> = {}
	): SettingsFieldConfig {
		return {
			key,
			label: getFieldLabel(key),
			type,
			help: getFieldHelp(key),
			...extras
		};
	}

	const settingSections: Array<{
		fields: SettingsFieldConfig[];
		icon: Component;
		title: SettingsSectionTitle;
	}> = [
		{
			title: SETTINGS_SECTION_TITLES.GENERAL,
			icon: Settings,
			fields: [
				createField(SETTINGS_KEYS.THEME, SettingsFieldType.SELECT, { options: themeOptions }),
				createField(SETTINGS_KEYS.LANGUAGE, SettingsFieldType.SELECT, {
					options: languageOptions
				}),
				createField(SETTINGS_KEYS.API_KEY, SettingsFieldType.INPUT),
				createField(SETTINGS_KEYS.SYSTEM_MESSAGE, SettingsFieldType.TEXTAREA),
				createField(SETTINGS_KEYS.PASTE_LONG_TEXT_TO_FILE_LEN, SettingsFieldType.INPUT),
				createField(
					SETTINGS_KEYS.COPY_TEXT_ATTACHMENTS_AS_PLAIN_TEXT,
					SettingsFieldType.CHECKBOX
				),
				createField(SETTINGS_KEYS.ENABLE_CONTINUE_GENERATION, SettingsFieldType.CHECKBOX, {
					isExperimental: true
				}),
				createField(SETTINGS_KEYS.PDF_AS_IMAGE, SettingsFieldType.CHECKBOX),
				createField(SETTINGS_KEYS.ASK_FOR_TITLE_CONFIRMATION, SettingsFieldType.CHECKBOX)
			]
		},
		{
			title: SETTINGS_SECTION_TITLES.DISPLAY,
			icon: Monitor,
			fields: [
				createField(SETTINGS_KEYS.SHOW_MESSAGE_STATS, SettingsFieldType.CHECKBOX),
				createField(SETTINGS_KEYS.SHOW_THOUGHT_IN_PROGRESS, SettingsFieldType.CHECKBOX),
				createField(SETTINGS_KEYS.KEEP_STATS_VISIBLE, SettingsFieldType.CHECKBOX),
				createField(SETTINGS_KEYS.AUTO_MIC_ON_EMPTY, SettingsFieldType.CHECKBOX, {
					isExperimental: true
				}),
				createField(SETTINGS_KEYS.RENDER_USER_CONTENT_AS_MARKDOWN, SettingsFieldType.CHECKBOX),
				createField(SETTINGS_KEYS.FULL_HEIGHT_CODE_BLOCKS, SettingsFieldType.CHECKBOX),
				createField(SETTINGS_KEYS.DISABLE_AUTO_SCROLL, SettingsFieldType.CHECKBOX),
				createField(SETTINGS_KEYS.ALWAYS_SHOW_SIDEBAR_ON_DESKTOP, SettingsFieldType.CHECKBOX),
				createField(SETTINGS_KEYS.AUTO_SHOW_SIDEBAR_ON_NEW_CHAT, SettingsFieldType.CHECKBOX),
				createField(SETTINGS_KEYS.SHOW_RAW_MODEL_NAMES, SettingsFieldType.CHECKBOX)
			]
		},
		{
			title: SETTINGS_SECTION_TITLES.SAMPLING,
			icon: Funnel,
			fields: [
				createField(SETTINGS_KEYS.TEMPERATURE, SettingsFieldType.INPUT),
				createField(SETTINGS_KEYS.DYNATEMP_RANGE, SettingsFieldType.INPUT),
				createField(SETTINGS_KEYS.DYNATEMP_EXPONENT, SettingsFieldType.INPUT),
				createField(SETTINGS_KEYS.TOP_K, SettingsFieldType.INPUT),
				createField(SETTINGS_KEYS.TOP_P, SettingsFieldType.INPUT),
				createField(SETTINGS_KEYS.MIN_P, SettingsFieldType.INPUT),
				createField(SETTINGS_KEYS.XTC_PROBABILITY, SettingsFieldType.INPUT),
				createField(SETTINGS_KEYS.XTC_THRESHOLD, SettingsFieldType.INPUT),
				createField(SETTINGS_KEYS.TYP_P, SettingsFieldType.INPUT),
				createField(SETTINGS_KEYS.MAX_TOKENS, SettingsFieldType.INPUT),
				createField(SETTINGS_KEYS.SAMPLERS, SettingsFieldType.INPUT),
				createField(SETTINGS_KEYS.BACKEND_SAMPLING, SettingsFieldType.CHECKBOX)
			]
		},
		{
			title: SETTINGS_SECTION_TITLES.PENALTIES,
			icon: AlertTriangle,
			fields: [
				createField(SETTINGS_KEYS.REPEAT_LAST_N, SettingsFieldType.INPUT),
				createField(SETTINGS_KEYS.REPEAT_PENALTY, SettingsFieldType.INPUT),
				createField(SETTINGS_KEYS.PRESENCE_PENALTY, SettingsFieldType.INPUT),
				createField(SETTINGS_KEYS.FREQUENCY_PENALTY, SettingsFieldType.INPUT),
				createField(SETTINGS_KEYS.DRY_MULTIPLIER, SettingsFieldType.INPUT),
				createField(SETTINGS_KEYS.DRY_BASE, SettingsFieldType.INPUT),
				createField(SETTINGS_KEYS.DRY_ALLOWED_LENGTH, SettingsFieldType.INPUT),
				createField(SETTINGS_KEYS.DRY_PENALTY_LAST_N, SettingsFieldType.INPUT)
			]
		},
		{
			title: SETTINGS_SECTION_TITLES.IMPORT_EXPORT,
			icon: Database,
			fields: []
		},
		{
			title: SETTINGS_SECTION_TITLES.MCP,
			icon: McpLogo,
			fields: [
				createField(SETTINGS_KEYS.AGENTIC_MAX_TURNS, SettingsFieldType.INPUT),
				createField(SETTINGS_KEYS.ALWAYS_SHOW_AGENTIC_TURNS, SettingsFieldType.CHECKBOX),
				createField(SETTINGS_KEYS.AGENTIC_MAX_TOOL_PREVIEW_LINES, SettingsFieldType.INPUT),
				createField(SETTINGS_KEYS.SHOW_TOOL_CALL_IN_PROGRESS, SettingsFieldType.CHECKBOX)
			]
		},
		{
			title: SETTINGS_SECTION_TITLES.DEVELOPER,
			icon: Code,
			fields: [
				createField(SETTINGS_KEYS.DISABLE_REASONING_PARSING, SettingsFieldType.CHECKBOX),
				createField(SETTINGS_KEYS.SHOW_RAW_OUTPUT_SWITCH, SettingsFieldType.CHECKBOX),
				createField(SETTINGS_KEYS.CUSTOM, SettingsFieldType.TEXTAREA)
			]
		}
		// TODO: Experimental features section will be implemented after initial release
		// This includes Python interpreter (Pyodide integration) and other experimental features
		// {
		// 	title: 'Experimental',
		// 	icon: Beaker,
		// 	fields: [
		// 		{
		// 			key: 'pyInterpreterEnabled',
		// 			label: 'Enable Python interpreter',
		// 			type: 'checkbox'
		// 		}
		// 	]
		// }
	];

	let activeSection = $derived<SettingsSectionTitle>(
		initialSection ?? SETTINGS_SECTION_TITLES.GENERAL
	);
	let currentSection = $derived(
		settingSections.find((section) => section.title === activeSection) || settingSections[0]
	);
	let localConfig: SettingsConfigType = $state({ ...config() });

	let canScrollLeft = $state(false);
	let canScrollRight = $state(false);
	let scrollContainer: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (initialSection) {
			activeSection = initialSection;
		}
	});

	function handleThemeChange(newTheme: string) {
		localConfig.theme = newTheme;

		setMode(newTheme as ColorMode);
	}

	function handleConfigChange(key: string, value: string | boolean) {
		localConfig[key] = value;
	}

	function handleReset() {
		localConfig = { ...config() };

		setMode(localConfig.theme as ColorMode);
	}

	function handleSave() {
		if (localConfig.custom && typeof localConfig.custom === 'string' && localConfig.custom.trim()) {
			try {
				JSON.parse(localConfig.custom);
			} catch (error) {
				alert(m.settings_invalid_json_custom_parameters());
				console.error(error);
				return;
			}
		}

		// Convert numeric strings to numbers for numeric fields
		const processedConfig = { ...localConfig };

		for (const field of NUMERIC_FIELDS) {
			if (processedConfig[field] !== undefined && processedConfig[field] !== '') {
				const numValue = Number(processedConfig[field]);
				if (!isNaN(numValue)) {
					if ((POSITIVE_INTEGER_FIELDS as readonly string[]).includes(field)) {
						processedConfig[field] = Math.max(1, Math.round(numValue));
					} else {
						processedConfig[field] = numValue;
					}
				} else {
					alert(m.settings_invalid_number_for_field({ field: getFieldLabel(field) }));
					return;
				}
			}
		}

		settingsStore.updateMultipleConfig(processedConfig);
		onSave?.();
	}

	function scrollToCenter(element: HTMLElement) {
		if (!scrollContainer) return;

		const containerRect = scrollContainer.getBoundingClientRect();
		const elementRect = element.getBoundingClientRect();

		const elementCenter = elementRect.left + elementRect.width / 2;
		const containerCenter = containerRect.left + containerRect.width / 2;
		const scrollOffset = elementCenter - containerCenter;

		scrollContainer.scrollBy({ left: scrollOffset, behavior: 'smooth' });
	}

	function scrollLeft() {
		if (!scrollContainer) return;

		scrollContainer.scrollBy({ left: -250, behavior: 'smooth' });
	}

	function scrollRight() {
		if (!scrollContainer) return;

		scrollContainer.scrollBy({ left: 250, behavior: 'smooth' });
	}

	function updateScrollButtons() {
		if (!scrollContainer) return;

		const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
		canScrollLeft = scrollLeft > 0;
		canScrollRight = scrollLeft < scrollWidth - clientWidth - 1; // -1 for rounding
	}

	export function reset() {
		localConfig = { ...config() };

		setTimeout(updateScrollButtons, 100);
	}

	$effect(() => {
		if (scrollContainer) {
			updateScrollButtons();
		}
	});
</script>

<div class="flex h-full flex-col overflow-hidden md:flex-row">
	<!-- Desktop Sidebar -->
	<div class="hidden w-64 border-r border-border/30 p-6 md:block">
		<nav class="space-y-1 py-2">
			{#each settingSections as section (section.title)}
				<button
					class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent {activeSection ===
					section.title
						? 'bg-accent text-accent-foreground'
						: 'text-muted-foreground'}"
					onclick={() => (activeSection = section.title)}
				>
					<section.icon class="h-4 w-4" />

					<span class="ml-2">{getSectionLabel(section.title)}</span>
				</button>
			{/each}
		</nav>
	</div>

	<!-- Mobile Header with Horizontal Scrollable Menu -->
	<div class="flex flex-col pt-6 md:hidden">
		<div class="border-b border-border/30 pt-4 md:py-4">
			<!-- Horizontal Scrollable Category Menu with Navigation -->
			<div class="relative flex items-center" style="scroll-padding: 1rem;">
				<button
					class="absolute left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-muted shadow-md backdrop-blur-sm transition-opacity hover:bg-accent {canScrollLeft
						? 'opacity-100'
						: 'pointer-events-none opacity-0'}"
					onclick={scrollLeft}
					aria-label={m.settings_scroll_left()}
				>
					<ChevronLeft class="h-4 w-4" />
				</button>

				<div
					class="scrollbar-hide overflow-x-auto py-2"
					bind:this={scrollContainer}
					onscroll={updateScrollButtons}
				>
					<div class="flex min-w-max gap-2">
						{#each settingSections as section (section.title)}
							<button
								class="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors first:ml-4 last:mr-4 hover:bg-accent {activeSection ===
								section.title
									? 'bg-accent text-accent-foreground'
									: 'text-muted-foreground'}"
								onclick={(e: MouseEvent) => {
									activeSection = section.title;
									scrollToCenter(e.currentTarget as HTMLElement);
								}}
							>
								<section.icon class="h-4 w-4 flex-shrink-0" />
								<span>{getSectionLabel(section.title)}</span>
							</button>
						{/each}
					</div>
				</div>

				<button
					class="absolute right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-muted shadow-md backdrop-blur-sm transition-opacity hover:bg-accent {canScrollRight
						? 'opacity-100'
						: 'pointer-events-none opacity-0'}"
					onclick={scrollRight}
					aria-label={m.settings_scroll_right()}
				>
					<ChevronRight class="h-4 w-4" />
				</button>
			</div>
		</div>
	</div>

	<ScrollArea class="max-h-[calc(100dvh-13.5rem)] flex-1 md:max-h-[calc(100vh-13.5rem)]">
		<div class="space-y-6 p-4 md:p-6">
			<div class="grid">
				<div class="mb-6 flex hidden items-center gap-2 border-b border-border/30 pb-6 md:flex">
					<currentSection.icon class="h-5 w-5" />

					<h3 class="text-lg font-semibold">{getSectionLabel(currentSection.title)}</h3>
				</div>

				{#if currentSection.title === SETTINGS_SECTION_TITLES.IMPORT_EXPORT}
					<ChatSettingsImportExportTab />
				{:else if currentSection.title === SETTINGS_SECTION_TITLES.MCP}
					<div class="space-y-6">
						<ChatSettingsFields
							fields={currentSection.fields}
							{localConfig}
							onConfigChange={handleConfigChange}
							onThemeChange={handleThemeChange}
						/>

						<div class="border-t border-border/30 pt-6">
							<McpServersSettings />
						</div>
					</div>
				{:else}
					<div class="space-y-6">
						<ChatSettingsFields
							fields={currentSection.fields}
							{localConfig}
							onConfigChange={handleConfigChange}
							onThemeChange={handleThemeChange}
						/>
					</div>
				{/if}
			</div>

			<div class="mt-8 border-t pt-6">
				<p class="text-xs text-muted-foreground">{m.settings_localstorage_notice()}</p>
			</div>
		</div>
	</ScrollArea>
</div>

<ChatSettingsFooter onReset={handleReset} onSave={handleSave} />
