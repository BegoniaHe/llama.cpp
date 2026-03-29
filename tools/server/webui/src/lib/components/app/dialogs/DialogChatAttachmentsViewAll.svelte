<script lang="ts">
	import { ChatAttachmentsViewAll } from '$lib/components/app';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		open?: boolean;
		uploadedFiles?: ChatUploadedFile[];
		attachments?: DatabaseMessageExtra[];
		readonly?: boolean;
		onFileRemove?: (fileId: string) => void;
		imageHeight?: string;
		imageWidth?: string;
		imageClass?: string;
		activeModelId?: string;
	}

	let {
		open = $bindable(false),
		uploadedFiles = [],
		attachments = [],
		readonly = false,
		onFileRemove,
		imageHeight = 'h-24',
		imageWidth = 'w-auto',
		imageClass = '',
		activeModelId
	}: Props = $props();

	let totalCount = $derived(uploadedFiles.length + attachments.length);
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay />

		<Dialog.Content class="flex !max-h-[90vh] !max-w-6xl flex-col">
			<Dialog.Header>
				<Dialog.Title
					>{m.dialog_chat_attachments_view_all_title({ count: String(totalCount) })}</Dialog.Title
				>
				<Dialog.Description>{m.dialog_chat_attachments_view_all_description()}</Dialog.Description>
			</Dialog.Header>

			<ChatAttachmentsViewAll
				{uploadedFiles}
				{attachments}
				{readonly}
				{onFileRemove}
				{imageHeight}
				{imageWidth}
				{imageClass}
				{activeModelId}
			/>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
