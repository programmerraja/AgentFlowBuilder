// Tool types - simplified to match specification

// Tool parameter (from workflow.ts)
export interface ToolParameter {
  id: string;
  type: string;
  required: boolean;
}

// Tool (from workflow.ts)
export interface Tool {
  name: string;
  description: string;
  parameters?: ToolParameter[];
}

// Tool execution context
export interface ToolExecutionContext {
  toolId: string;
  parameters: Record<string, unknown>;
  state: Record<string, unknown>;
  workflow: string;
  node: string;
  user: string;
  session: string;
  metadata: ExecutionMetadata;
}

// Tool execution result
export interface ToolExecutionResult {
  success: boolean;
  result?: unknown;
  error?: ToolError;
  metadata: ExecutionResultMetadata;
}

// Tool error
export interface ToolError {
  code: string;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  recoverable: boolean;
  suggestions?: string[];
}

// Execution metadata
export interface ExecutionMetadata {
  requestId: string;
  timestamp: Date;
  timeout: number;
  retryCount: number;
  priority: number;
  tags: string[];
}

// Execution result metadata
export interface ExecutionResultMetadata {
  duration: number;
  memoryUsage: number;
  tokens?: number;
  cost?: number;
  cacheHit?: boolean;
  retries: number;
}

// Tool registry
export interface ToolRegistry {
  tools: Map<string, Tool>;
  register: (tool: Tool) => void;
  unregister: (toolId: string) => void;
  getTool: (toolId: string) => Promise<Tool | null>;
  searchTools: (query: string) => Promise<Tool[]>;
  validateTool: (tool: Tool) => Promise<ToolValidationResult>;
}

// Tool validation result
export interface ToolValidationResult {
  valid: boolean;
  errors: ToolValidationError[];
  warnings: ToolValidationWarning[];
}

// Tool validation error
export interface ToolValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  code?: string;
}

// Tool validation warning
export interface ToolValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// Tool executor interface
export interface ToolExecutor {
  execute: (context: ToolExecutionContext) => Promise<ToolExecutionResult>;
  validate: (tool: Tool, parameters: Record<string, unknown>) => Promise<ToolValidationResult>;
  canExecute: (tool: Tool, context: ToolExecutionContext) => Promise<boolean>;
}

// Tool configuration
export interface ToolConfiguration {
  enabled: boolean;
  timeout: number;
  retryCount: number;
  retryDelay: number;
  cacheEnabled: boolean;
  cacheTTL: number;
  rateLimit?: RateLimit;
  permissions: string[];
  environment: Record<string, unknown>;
}

// Rate limit
export interface RateLimit {
  requests: number;
  window: number; // in milliseconds
  burst?: number;
}

// Tool operation
export type ToolOperation = 
  | { type: 'EXECUTE'; toolId: string; parameters: Record<string, unknown> }
  | { type: 'VALIDATE'; toolId: string; parameters: Record<string, unknown> }
  | { type: 'CANCEL'; executionId: string }
  | { type: 'RETRY'; executionId: string; parameters?: Record<string, unknown> };

// Tool state
export interface ToolState {
  tools: Map<string, Tool>;
  executions: Map<string, ToolExecution>;
  configuration: ToolConfiguration;
  registry: ToolRegistry;
  executor: ToolExecutor;
  isLoading: boolean;
  error: string | null;
}

// Tool execution
export interface ToolExecution {
  id: string;
  toolId: string;
  status: ExecutionStatus;
  context: ToolExecutionContext;
  result?: ToolExecutionResult;
  startedAt: Date;
  completedAt?: Date;
  metadata: ExecutionMetadata;
}

// Execution status
export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout',
}

// Tool action
export type ToolAction = 
  | { type: 'REGISTER_TOOL'; tool: Tool }
  | { type: 'UNREGISTER_TOOL'; toolId: string }
  | { type: 'EXECUTE_TOOL'; context: ToolExecutionContext }
  | { type: 'CANCEL_EXECUTION'; executionId: string }
  | { type: 'UPDATE_CONFIGURATION'; configuration: Partial<ToolConfiguration> }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null };

// Tool factory
export type ToolFactory = (config: Partial<Tool>) => Tool;

// Tool validator
export type ToolValidator = (tool: Tool) => ToolValidationResult;

// Tool executor factory
export type ToolExecutorFactory = (tool: Tool) => ToolExecutor;
