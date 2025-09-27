// Node types - no external imports needed

// Position interface for React Flow compatibility
export interface Position {
  x: number;
  y: number;
}

// Node state for UI
export interface NodeState {
  isSelected: boolean;
  isHovered: boolean;
  isDragging: boolean;
  isConnecting: boolean;
  hasErrors: boolean;
  isProcessing: boolean;
  isDisabled: boolean;
}

// Node validation result
export interface NodeValidation {
  valid: boolean;
  errors: NodeError[];
  warnings: NodeWarning[];
}

// Node error
export interface NodeError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  code?: string;
}

// Node warning
export interface NodeWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// Node operations
export type NodeOperation = 
  | { type: 'CREATE'; nodeName: string; node: any; position: Position }
  | { type: 'UPDATE'; nodeName: string; updates: Partial<any> }
  | { type: 'DELETE'; nodeName: string }
  | { type: 'MOVE'; nodeName: string; position: Position }
  | { type: 'RESIZE'; nodeName: string; size: { width: number; height: number } }
  | { type: 'SELECT'; nodeName: string | null }
  | { type: 'VALIDATE'; nodeName: string; validation: NodeValidation };

// Node factory function type
export type NodeFactory = (config: Partial<any>) => any;

// Node validator function type
export type NodeValidator = (node: any) => NodeValidation;

// Node renderer props
export interface NodeRendererProps {
  node: any;
  data: any;
  isSelected: boolean;
  isHovered: boolean;
  hasErrors: boolean;
  onUpdate: (updates: Partial<any>) => void;
  onDelete: () => void;
  onSelect: () => void;
}
