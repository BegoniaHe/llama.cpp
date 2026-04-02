<script lang="ts">
	import { SyntaxHighlightedCode } from '$lib/components/app';
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { m } from '$lib/paraglide/messages';
	import { modelsStore } from '$lib/stores/models.svelte';
	import {
		createBase64DataUrl,
		getLanguageFromFilename,
		isAudioFile,
		isImageFile,
		isPdfFile,
		isTextFile
	} from '$lib/utils';
	import { convertPDFToImage } from '$lib/utils/browser-only';
	import { Eye, FileIcon, FileText, Image, Info, Music } from '@lucide/svelte';

	interface Props {
		// Either an uploaded file or a stored attachment
		uploadedFile?: ChatUploadedFile;
		attachment?: DatabaseMessageExtra;
		// For uploaded files
		preview?: string;
		name?: string;
		textContent?: string;
		// For checking vision modality
		activeModelId?: string;
	}

	let { uploadedFile, attachment, preview, name, textContent, activeModelId }: Props = $props();

	let hasVisionModality = $derived(
		activeModelId ? modelsStore.modelSupportsVision(activeModelId) : false
	);

	let displayName = $derived(
		uploadedFile?.name ||
			attachment?.name ||
			name ||
			m.dialog_chat_attachment_preview_unknown_file()
	);

	// Determine file type from uploaded file or attachment
	let isAudio = $derived(isAudioFile(attachment, uploadedFile));
	let isImage = $derived(isImageFile(attachment, uploadedFile));
	let isPdf = $derived(isPdfFile(attachment, uploadedFile));
	let isText = $derived(isTextFile(attachment, uploadedFile));

	let displayPreview = $derived(
		uploadedFile?.preview ||
			(isImage && attachment && 'base64Url' in attachment ? attachment.base64Url : preview)
	);

	let displayTextContent = $derived(
		uploadedFile?.textContent ||
			(attachment && 'content' in attachment ? attachment.content : textContent)
	);

	let language = $derived(getLanguageFromFilename(displayName));

	let IconComponent = $derived(() => {
		if (isImage) return Image;
		if (isText || isPdf) return FileText;
		if (isAudio) return Music;

		return FileIcon;
	});

	let pdfViewMode = $state<'text' | 'pages'>('pages');

	let pdfImages = $state<string[]>([]);

	let pdfImagesLoading = $state(false);

	let pdfImagesError = $state<string | null>(null);

	async function loadPdfImages() {
		if (!isPdf || pdfImages.length > 0 || pdfImagesLoading) return;

		pdfImagesLoading = true;
		pdfImagesError = null;

		try {
			let file: File | null = null;

			if (uploadedFile?.file) {
				file = uploadedFile.file;
			} else if (isPdf && attachment) {
				// Check if we have pre-processed images
				if (
					'images' in attachment &&
					attachment.images &&
					Array.isArray(attachment.images) &&
					attachment.images.length > 0
				) {
					pdfImages = attachment.images;
					return;
				}

				// Convert base64 back to File for processing
				if ('base64Data' in attachment && attachment.base64Data) {
					const base64Data = attachment.base64Data;
					const byteCharacters = atob(base64Data);
					const byteNumbers = new Array(byteCharacters.length);
					for (let i = 0; i < byteCharacters.length; i++) {
						byteNumbers[i] = byteCharacters.charCodeAt(i);
					}
					const byteArray = new Uint8Array(byteNumbers);
					file = new File([byteArray], displayName, { type: 'application/pdf' });
				}
			}

			if (file) {
				pdfImages = await convertPDFToImage(file);
			} else {
				throw new Error('No PDF file available for conversion');
			}
		} catch (error) {
			pdfImagesError =
				error instanceof Error ? error.message : m.dialog_chat_attachment_preview_pdf_load_failed();
		} finally {
			pdfImagesLoading = false;
		}
	}

	export function reset() {
		pdfImages = [];
		pdfImagesLoading = false;
		pdfImagesError = null;
		pdfViewMode = 'pages';
	}

	$effect(() => {
		if (isPdf && pdfViewMode === 'pages') {
			loadPdfImages();
		}
	});
</script>

<div class="space-y-4">
	<div class="flex items-center justify-end gap-6">
		{#if isPdf}
			<div class="flex items-center gap-2">
				<Button
					variant={pdfViewMode === 'text' ? 'default' : 'outline'}
					size="sm"
					onclick={() => (pdfViewMode = 'text')}
					disabled={pdfImagesLoading}
				>
					<FileText class="mr-1 h-4 w-4" />

					{m.dialog_chat_attachment_preview_text_tab()}
				</Button>

				<Button
					variant={pdfViewMode === 'pages' ? 'default' : 'outline'}
					size="sm"
					onclick={() => {
						pdfViewMode = 'pages';
						loadPdfImages();
					}}
					disabled={pdfImagesLoading}
				>
					{#if pdfImagesLoading}
						<div
							class="mr-1 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
						></div>
					{:else}
						<Eye class="mr-1 h-4 w-4" />
					{/if}

					{m.dialog_chat_attachment_preview_pages_tab()}
				</Button>
			</div>
		{/if}
	</div>

	<div class="flex-1 overflow-auto">
		{#if isImage && displayPreview}
			<div class="flex items-center justify-center">
				<img
					src={displayPreview}
					alt={displayName}
					class="max-h-full rounded-lg object-contain shadow-lg"
				/>
			</div>
		{:else if isPdf && pdfViewMode === 'pages'}
			{#if !hasVisionModality && activeModelId}
				<Alert.Root class="mb-4">
					<Info class="h-4 w-4" />
					<Alert.Title>{m.dialog_chat_attachment_preview_only_title()}</Alert.Title>
					<Alert.Description>
						<span class="inline-flex">
							{m.dialog_chat_attachment_preview_only_description_prefix()}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<span class="mx-1 cursor-pointer underline" onclick={() => (pdfViewMode = 'text')}>
								{m.dialog_chat_attachment_preview_only_link()}
							</span>
							{m.dialog_chat_attachment_preview_only_description_suffix()}
						</span>
					</Alert.Description>
				</Alert.Root>
			{/if}

			{#if pdfImagesLoading}
				<div class="flex items-center justify-center p-8">
					<div class="text-center">
						<div
							class="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
						></div>

						<p class="text-muted-foreground">{m.dialog_chat_attachment_preview_pdf_converting()}</p>
					</div>
				</div>
			{:else if pdfImagesError}
				<div class="flex items-center justify-center p-8">
					<div class="text-center">
						<FileText class="mx-auto mb-4 h-16 w-16 text-muted-foreground" />

						<p class="mb-4 text-muted-foreground">
							{m.dialog_chat_attachment_preview_pdf_load_failed()}
						</p>

						<p class="text-sm text-muted-foreground">{pdfImagesError}</p>

						<Button class="mt-4" onclick={() => (pdfViewMode = 'text')}
							>{m.dialog_chat_attachment_view_as_text()}</Button
						>
					</div>
				</div>
			{:else if pdfImages.length > 0}
				<div class="max-h-[70vh] space-y-4 overflow-auto">
					{#each pdfImages as image, index (image)}
						<div class="text-center">
							<p class="mb-2 text-sm text-muted-foreground">
								{m.dialog_chat_attachment_preview_pdf_page({ page: String(index + 1) })}
							</p>

							<img
								src={image}
								alt={m.dialog_chat_attachment_preview_pdf_page_alt({ page: String(index + 1) })}
								class="mx-auto max-w-full rounded-lg shadow-lg"
							/>
						</div>
					{/each}
				</div>
			{:else}
				<div class="flex items-center justify-center p-8">
					<div class="text-center">
						<FileText class="mx-auto mb-4 h-16 w-16 text-muted-foreground" />

						<p class="mb-4 text-muted-foreground">
							{m.dialog_chat_attachment_preview_pdf_no_pages()}
						</p>
					</div>
				</div>
			{/if}
		{:else if (isText || (isPdf && pdfViewMode === 'text')) && displayTextContent}
			<SyntaxHighlightedCode code={displayTextContent} {language} maxWidth="calc(69rem - 2rem)" />
		{:else if isAudio}
			<div class="flex items-center justify-center p-8">
				<div class="w-full max-w-md text-center">
					<Music class="mx-auto mb-4 h-16 w-16 text-muted-foreground" />

					{#if uploadedFile?.preview}
						<audio controls class="mb-4 w-full" src={uploadedFile.preview}>
							{m.dialog_chat_attachment_audio_fallback()}
						</audio>
					{:else if isAudio && attachment && 'mimeType' in attachment && 'base64Data' in attachment}
						<audio
							controls
							class="mb-4 w-full"
							src={createBase64DataUrl(attachment.mimeType, attachment.base64Data)}
						>
							{m.dialog_chat_attachment_audio_fallback()}
						</audio>
					{:else}
						<p class="mb-4 text-muted-foreground">
							{m.dialog_chat_attachment_audio_preview_unavailable()}
						</p>
					{/if}

					<p class="text-sm text-muted-foreground">
						{displayName}
					</p>
				</div>
			</div>
		{:else}
			<div class="flex items-center justify-center p-8">
				<div class="text-center">
					{#if IconComponent}
						<IconComponent class="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
					{/if}

					<p class="mb-4 text-muted-foreground">{m.dialog_chat_attachment_preview_unavailable()}</p>
				</div>
			</div>
		{/if}
	</div>
</div>
