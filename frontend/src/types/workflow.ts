// Workflow types - no external imports needed

// Tool parameter
export interface ToolParameter {
  id: string;
  type: string;
  required: boolean;
}

// Tool
export interface Tool {
  name: string;
  description: string;
  parameters?: ToolParameter[];
}

// Node affects
export interface NodeAffects {
  name: string;
  description: string;
}

// State key
export interface StateKey {
  id: string;
  required: boolean;
  description?: string;
  nodeAffects?: NodeAffects;
}

// Edge
export interface Edge {
  nodeName: string;
  condition: string;
  stateKeys: StateKey[];
}

// Node
export interface Node {
  isFirstNode?: boolean;
  preAction?: string[];
  postAction?: string[];
  stateKeys?: StateKey[];
  tools?: Tool[];
  prompt: string;
  edges?: Edge[];
  // Canvas position for UI
  position?: { x: number; y: number };
}

// Conversation state
export interface ConversationState {
  currentStep: string;
  previousStep: string;
  completedSteps: string[];
}

// Workflow states
export interface WorkflowStates {
  conversationState: ConversationState;
  data: Record<string, any>;
  stateKeyValueMap?: Record<string, string>;
}

// Workflow summary
export interface WorkflowSummary {
  name: string;
  workflows: Record<
    string,
    {
      action: string;
      dependsOn?: string[];
      next?: string[];
    }
  >;
}

// Workflow
export interface Workflow {
  name: string;
  description: string;
  requiredWorkflow?: {
    must: string[];
    desc: string;
  };
  nodes: Record<string, Node>;
  states: WorkflowStates;
  summary: WorkflowSummary;
}

// Global states
export interface GlobalStates {
  conversationState: {
    currentWorkflow: string;
    previousWorkflow: string;
    completedWorkflows: string[];
  };
  data: Record<string, any>;
}

// Workflows root
export interface WorkflowsRoot {
  workflows: Record<string, Workflow> & {
    states: GlobalStates;
  };
}

// Workflow editor state (for UI)
export interface WorkflowEditor {
  currentWorkflow: Workflow | null;
  selectedNode: string | null;
  selectedEdge: string | null;
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  isDirty: boolean;
  lastSaved: Date | null;
}

// Workflow validation result
export interface WorkflowValidation {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// Validation error
export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
  code?: string;
  data?: unknown;
}

// Validation warning
export interface ValidationWarning {
  path: string;
  message: string;
  suggestion?: string;
  data?: unknown;
}

// React Flow integration types
export interface WorkflowNodeData {
  node: Node;
  isSelected: boolean;
  hasErrors: boolean;
  isConnected: boolean;
}

export interface WorkflowEdgeData {
  edge: Edge;
  isSelected: boolean;
  isAnimated: boolean;
}

// Workflow operations
export type WorkflowOperation = 
  | { type: 'CREATE_NODE'; nodeName: string; node: Node; position: { x: number; y: number } }
  | { type: 'UPDATE_NODE'; nodeName: string; updates: Partial<Node> }
  | { type: 'DELETE_NODE'; nodeName: string }
  | { type: 'CREATE_EDGE'; nodeName: string; edge: Edge }
  | { type: 'UPDATE_EDGE'; nodeName: string; edgeIndex: number; updates: Partial<Edge> }
  | { type: 'DELETE_EDGE'; nodeName: string; edgeIndex: number }
  | { type: 'UPDATE_WORKFLOW'; updates: Partial<Workflow> }
  | { type: 'SELECT_NODE'; nodeName: string | null }
  | { type: 'SELECT_EDGE'; nodeName: string; edgeIndex: number | null }
  | { type: 'UPDATE_VIEWPORT'; viewport: { x: number; y: number; zoom: number } };

// Workflow state management
export interface WorkflowState {
  workflows: Record<string, Workflow>;
  currentWorkflow: Workflow | null;
  editor: WorkflowEditor;
  validation: WorkflowValidation;
  isLoading: boolean;
  error: string | null;
}

// Workflow actions
export type WorkflowAction = 
  | { type: 'LOAD_WORKFLOWS'; workflows: Record<string, Workflow> }
  | { type: 'SET_CURRENT_WORKFLOW'; workflow: Workflow | null }
  | { type: 'UPDATE_WORKFLOW'; workflowId: string; updates: Partial<Workflow> }
  | { type: 'DELETE_WORKFLOW'; workflowId: string }
  | { type: 'APPLY_OPERATION'; operation: WorkflowOperation }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'VALIDATE_WORKFLOW'; validation: WorkflowValidation }
  | { type: 'RESET_EDITOR' };
