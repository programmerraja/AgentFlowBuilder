// State types - simplified to match specification

// State key (from workflow.ts)
export interface StateKey {
  id: string;
  required: boolean;
  description?: string;
  nodeAffects?: {
    name: string;
    description: string;
  };
}

// Conversation state (from workflow.ts)
export interface ConversationState {
  currentStep: string;
  previousStep: string;
  completedSteps: string[];
}

// Workflow states (from workflow.ts)
export interface WorkflowStates {
  conversationState: ConversationState;
  data: Record<string, any>;
  stateKeyValueMap?: Record<string, string>;
}

// Global states (from workflow.ts)
export interface GlobalStates {
  conversationState: {
    currentWorkflow: string;
    previousWorkflow: string;
    completedWorkflows: string[];
  };
  data: Record<string, any>;
}

// State operations
export type StateOperation = 
  | { type: 'SET_STATE'; key: string; value: unknown; scope: string }
  | { type: 'UPDATE_STATE'; key: string; updates: Record<string, unknown>; scope: string }
  | { type: 'DELETE_STATE'; key: string; scope: string }
  | { type: 'CLEAR_STATE'; scope: string }
  | { type: 'MERGE_STATE'; state: Record<string, unknown>; scope: string }
  | { type: 'RESET_STATE'; scope: string };

// State change callback
export type StateChangeCallback = (key: string, value: unknown, oldValue: unknown) => void;

// State validation result
export interface StateValidationResult {
  valid: boolean;
  errors: StateValidationError[];
  warnings: StateValidationWarning[];
}

// State validation error
export interface StateValidationError {
  key: string;
  message: string;
  severity: 'error' | 'warning';
  code?: string;
  value?: unknown;
}

// State validation warning
export interface StateValidationWarning {
  key: string;
  message: string;
  suggestion?: string;
  value?: unknown;
}
