/**
 * Unified exports for all type definitions
 * Import types from '$lib/types' for cleaner imports
 */

// API types
export type {
	ApiChatCompletionRequest,
	ApiChatCompletionResponse,
	ApiChatCompletionStreamChunk,
	ApiChatCompletionToolCall,
	ApiChatCompletionToolCallDelta,
	ApiChatCompletionToolCallFunctionDelta,
	ApiChatMessageContentPart,
	ApiChatMessageData,
	ApiContextSizeError,
	ApiErrorResponse,
	ApiLlamaCppServerProps,
	ApiModelDataEntry,
	ApiModelDetails,
	ApiModelListResponse,
	ApiModelStatus,
	ApiProcessingState,
	ApiRouterModelMeta,
	ApiRouterModelsListResponse,
	ApiRouterModelsLoadRequest,
	ApiRouterModelsLoadResponse,
	ApiRouterModelsStatusRequest,
	ApiRouterModelsStatusResponse,
	ApiRouterModelsUnloadRequest,
	ApiRouterModelsUnloadResponse,
	ApiSlotData
} from './api';

// Chat types
export type {
	AttachmentDisplayItemsOptions,
	ChatAttachmentDisplayItem,
	ChatAttachmentPreviewItem,
	ChatMessageAgenticTimings,
	ChatMessageAgenticTurnStats,
	ChatMessagePromptProgress,
	ChatMessageSiblingInfo,
	ChatMessageTimings,
	ChatMessageToolCallTiming,
	ChatStreamCallbacks,
	ChatUploadedFile,
	ErrorDialogState,
	FileProcessingResult,
	LiveGenerationStats,
	LiveProcessingStats
} from './chat.d';

// Database types
export type {
	DatabaseConversation,
	DatabaseMessage,
	DatabaseMessageExtra,
	DatabaseMessageExtraAudioFile,
	DatabaseMessageExtraImageFile,
	DatabaseMessageExtraLegacyContext,
	DatabaseMessageExtraMcpPrompt,
	DatabaseMessageExtraMcpResource,
	DatabaseMessageExtraPdfFile,
	DatabaseMessageExtraTextFile,
	ExportedConversation,
	ExportedConversations,
	McpServerOverride
} from './database';

// Model types
export type {
	ModalityCapabilities,
	ModelModalities,
	ModelOperationDiagnostic,
	ModelOperationKind,
	ModelOperationState,
	ModelOption
} from './models';

// Settings types
export type {
	ParameterInfo,
	ParameterRecord,
	ParameterValue,
	SettingsChatServiceOptions,
	SettingsConfigType,
	SettingsConfigValue,
	SettingsFieldConfig,
	SyncableParameter
} from './settings';

// Common types
export type {
	BinaryDetectionOptions,
	ClipboardAttachment,
	ClipboardMcpPromptAttachment,
	ClipboardTextAttachment,
	KeyValuePair,
	ParsedClipboardContent
} from './common';

// MCP types
export type {
	ClientCapabilities,
	GetPromptResult,
	HealthCheckParams,
	HealthCheckState,
	Implementation,
	MCPBlobResourceContent,
	MCPCachedResource,
	MCPCapabilitiesInfo,
	MCPClientConfig,
	MCPConnection,
	MCPConnectionDetails,
	MCPConnectionLog,
	MCPPhaseCallback,
	MCPProgressState,
	MCPPromptInfo,
	MCPReadResourceResult,
	MCPResource,
	MCPResourceAnnotations,
	MCPResourceAttachment,
	MCPResourceContent,
	MCPResourceIcon,
	MCPResourceInfo,
	MCPResourceSubscription,
	MCPResourceTemplate,
	MCPResourceTemplateInfo,
	MCPServerConfig,
	MCPServerInfo,
	MCPServerResources,
	MCPServerSettingsEntry,
	MCPTextResourceContent,
	MCPToolCall,
	MCPToolInfo,
	OpenAIToolDefinition,
	Prompt,
	PromptMessage,
	ServerCapabilities,
	ServerStatus,
	Tool,
	ToolCallParams,
	ToolExecutionResult
} from './mcp';

// Agentic types
export type {
	AgenticAssistantMessage,
	AgenticChatCompletionRequest,
	AgenticConfig,
	AgenticFlowCallbacks,
	AgenticFlowOptions,
	AgenticFlowParams,
	AgenticFlowResult,
	AgenticMessage,
	AgenticSession,
	AgenticToolCallList,
	AgenticToolCallPayload
} from './agentic';
