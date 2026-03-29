<script lang="ts">
	import { ActionIconCopyToClipboard, BadgeModality } from '$lib/components/app';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Table from '$lib/components/ui/table';
	import * as m from '$lib/paraglide/messages';
	import { modelOptions, modelsLoading, modelsStore } from '$lib/stores/models.svelte';
	import { serverStore } from '$lib/stores/server.svelte';
	import type { ApiLlamaCppServerProps } from '$lib/types';
	import { formatFileSize, formatNumber, formatParameters } from '$lib/utils';

	interface Props {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		// when set, fetch props from the child process (router mode)
		modelId?: string | null;
	}

	let { open = $bindable(), onOpenChange, modelId = null }: Props = $props();

	let isRouter = $derived(serverStore.isRouterMode);

	// per-model props fetched from the child process
	let routerModelProps = $state<ApiLlamaCppServerProps | null>(null);
	let isLoadingRouterProps = $state(false);

	// in router mode use per-model props, otherwise use global props
	let serverProps = $derived(isRouter && modelId ? routerModelProps : serverStore.props);

	let modelName = $derived(isRouter && modelId ? modelId : modelsStore.singleModelName);
	let models = $derived(modelOptions());
	let isLoadingModels = $derived(modelsLoading());

	// in router mode, find the model option matching modelId
	// in single mode, use the first model as before
	let firstModel = $derived.by(() => {
		if (isRouter && modelId) {
			return models.find((m) => m.model === modelId) ?? null;
		}
		return models[0] ?? null;
	});

	// Get modalities from modelStore using the model ID from the first model
	let modalities = $derived.by(() => {
		if (!firstModel?.id) return [];
		return modelsStore.getModelModalitiesArray(firstModel.id);
	});

	// Ensure models are fetched when dialog opens
	$effect(() => {
		if (open && models.length === 0) {
			modelsStore.fetch();
		}
	});

	// fetch per-model props from child process when dialog opens in router mode
	$effect(() => {
		if (open && isRouter && modelId) {
			isLoadingRouterProps = true;
			modelsStore
				.fetchModelProps(modelId)
				.then((props) => {
					routerModelProps = props;
				})
				.catch(() => {
					routerModelProps = null;
				})
				.finally(() => {
					isLoadingRouterProps = false;
				});
		}
		if (!open) {
			routerModelProps = null;
		}
	});

	function formatTokenCount(value: number) {
		return m.dialog_model_information_tokens({ count: formatNumber(value) });
	}
</script>

<Dialog.Root bind:open {onOpenChange}>
	<Dialog.Content class="@container z-9999 !max-h-[80dvh] !max-w-[60rem] max-w-full">
		<style>
			@container (max-width: 56rem) {
				.resizable-text-container {
					max-width: calc(100vw - var(--threshold));
				}
			}
		</style>

		<Dialog.Header>
			<Dialog.Title>{m.dialog_model_information_title()}</Dialog.Title>

			<Dialog.Description>{m.dialog_model_information_description()}</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-6 py-4">
			{#if isLoadingModels || isLoadingRouterProps}
				<div class="flex items-center justify-center py-8">
					<div class="text-sm text-muted-foreground">{m.dialog_model_information_loading()}</div>
				</div>
			{:else if firstModel}
				{@const modelMeta = firstModel.meta}

				{#if serverProps}
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-[10rem]">{m.dialog_model_information_model()}</Table.Head>

								<Table.Head>
									<div class="inline-flex items-center gap-2">
										<span
											class="resizable-text-container min-w-0 flex-1 truncate"
											style:--threshold="12rem"
										>
											{modelName}
										</span>

										<ActionIconCopyToClipboard
											text={modelName || ''}
											canCopy={!!modelName}
											ariaLabel={m.dialog_model_information_copy_model_name()}
										/>
									</div>
								</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							<!-- Model Path -->
							<Table.Row>
								<Table.Cell class="h-10 align-middle font-medium"
									>{m.dialog_model_information_file_path()}</Table.Cell
								>

								<Table.Cell
									class="inline-flex h-10 items-center gap-2 align-middle font-mono text-xs"
								>
									<span
										class="resizable-text-container min-w-0 flex-1 truncate"
										style:--threshold="14rem"
									>
										{serverProps.model_path}
									</span>

									<ActionIconCopyToClipboard
										text={serverProps.model_path}
										ariaLabel={m.dialog_model_information_copy_model_path()}
									/>
								</Table.Cell>
							</Table.Row>

							<!-- Context Size -->
							{#if serverProps?.default_generation_settings?.n_ctx}
								<Table.Row>
									<Table.Cell class="h-10 align-middle font-medium"
										>{m.dialog_model_information_context_size()}</Table.Cell
									>

									<Table.Cell
										>{formatTokenCount(serverProps.default_generation_settings.n_ctx)}</Table.Cell
									>
								</Table.Row>
							{:else}
								<Table.Row>
									<Table.Cell class="h-10 align-middle font-medium text-red-500"
										>{m.dialog_model_information_context_size()}</Table.Cell
									>

									<Table.Cell class="text-red-500"
										>{m.dialog_model_information_not_available()}</Table.Cell
									>
								</Table.Row>
							{/if}

							<!-- Training Context -->
							{#if modelMeta?.n_ctx_train}
								<Table.Row>
									<Table.Cell class="h-10 align-middle font-medium"
										>{m.dialog_model_information_training_context()}</Table.Cell
									>

									<Table.Cell>{formatTokenCount(modelMeta.n_ctx_train)}</Table.Cell>
								</Table.Row>
							{/if}

							<!-- Model Size -->
							{#if modelMeta?.size}
								<Table.Row>
									<Table.Cell class="h-10 align-middle font-medium"
										>{m.dialog_model_information_model_size()}</Table.Cell
									>

									<Table.Cell>{formatFileSize(modelMeta.size)}</Table.Cell>
								</Table.Row>
							{/if}

							<!-- Parameters -->
							{#if modelMeta?.n_params}
								<Table.Row>
									<Table.Cell class="h-10 align-middle font-medium"
										>{m.dialog_model_information_parameters()}</Table.Cell
									>

									<Table.Cell>{formatParameters(modelMeta.n_params)}</Table.Cell>
								</Table.Row>
							{/if}

							<!-- Embedding Size -->
							{#if modelMeta?.n_embd}
								<Table.Row>
									<Table.Cell class="align-middle font-medium"
										>{m.dialog_model_information_embedding_size()}</Table.Cell
									>

									<Table.Cell>{formatNumber(modelMeta.n_embd)}</Table.Cell>
								</Table.Row>
							{/if}

							<!-- Vocabulary Size -->
							{#if modelMeta?.n_vocab}
								<Table.Row>
									<Table.Cell class="align-middle font-medium"
										>{m.dialog_model_information_vocabulary_size()}</Table.Cell
									>

									<Table.Cell>{formatTokenCount(modelMeta.n_vocab)}</Table.Cell>
								</Table.Row>
							{/if}

							<!-- Vocabulary Type -->
							{#if modelMeta?.vocab_type}
								<Table.Row>
									<Table.Cell class="align-middle font-medium"
										>{m.dialog_model_information_vocabulary_type()}</Table.Cell
									>
									<Table.Cell class="align-middle capitalize">{modelMeta.vocab_type}</Table.Cell>
								</Table.Row>
							{/if}

							<!-- Total Slots -->
							<Table.Row>
								<Table.Cell class="align-middle font-medium"
									>{m.dialog_model_information_parallel_slots()}</Table.Cell
								>

								<Table.Cell>{serverProps.total_slots}</Table.Cell>
							</Table.Row>

							<!-- Modalities -->
							{#if modalities.length > 0}
								<Table.Row>
									<Table.Cell class="align-middle font-medium"
										>{m.dialog_model_information_modalities()}</Table.Cell
									>

									<Table.Cell>
										<div class="flex flex-wrap gap-1">
											<BadgeModality {modalities} />
										</div>
									</Table.Cell>
								</Table.Row>
							{/if}

							<!-- Build Info -->
							<Table.Row>
								<Table.Cell class="align-middle font-medium"
									>{m.dialog_model_information_build_info()}</Table.Cell
								>

								<Table.Cell class="align-middle font-mono text-xs"
									>{serverProps.build_info}</Table.Cell
								>
							</Table.Row>

							<!-- Chat Template -->
							{#if serverProps.chat_template}
								<Table.Row>
									<Table.Cell class="align-middle font-medium"
										>{m.dialog_model_information_chat_template()}</Table.Cell
									>

									<Table.Cell class="py-10">
										<div class="rounded-md bg-muted p-4">
											<pre
												class="font-mono text-xs whitespace-pre-wrap">{serverProps.chat_template}</pre>
										</div>
									</Table.Cell>
								</Table.Row>
							{/if}
						</Table.Body>
					</Table.Root>
				{/if}
			{:else if !isLoadingModels}
				<div class="flex items-center justify-center py-8">
					<div class="text-sm text-muted-foreground">{m.dialog_model_information_empty()}</div>
				</div>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
