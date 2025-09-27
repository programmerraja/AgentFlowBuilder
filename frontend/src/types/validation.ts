// Validation types - simplified to match specification

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// Validation error
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  code?: string;
  data?: unknown;
}

// Validation warning
export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
  data?: unknown;
}

// Workflow validation
export interface WorkflowValidation {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// Node validation
export interface NodeValidation {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// Edge validation
export interface EdgeValidation {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// State validation
export interface StateValidation {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// Tool validation
export interface ToolValidation {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// Field validation
export interface FieldValidation {
  field: string;
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  value: unknown;
}

// Parameter validation
export interface ParameterValidation {
  parameter: string;
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  value: unknown;
}

// Validation schema
export interface ValidationSchema {
  id: string;
  name: string;
  type: string;
  version: string;
  schema: Record<string, unknown>;
}

// Validator interface
export interface Validator {
  id: string;
  name: string;
  type: string;
  version: string;
  validate: (data: unknown, schema: ValidationSchema) => ValidationResult;
  canValidate: (schema: ValidationSchema) => boolean;
}

// Validation engine
export interface ValidationEngine {
  validators: Map<string, Validator>;
  schemas: Map<string, ValidationSchema>;
  registerValidator: (validator: Validator) => void;
  registerSchema: (schema: ValidationSchema) => void;
  validate: (data: unknown, schemaId: string) => Promise<ValidationResult>;
  validateWorkflow: (workflow: unknown) => Promise<WorkflowValidation>;
  validateNode: (node: unknown, schemaId: string) => Promise<NodeValidation>;
  validateEdge: (edge: unknown, schemaId: string) => Promise<EdgeValidation>;
  validateState: (state: unknown, schemaId: string) => Promise<StateValidation>;
  validateTool: (tool: unknown, schemaId: string) => Promise<ToolValidation>;
}

// Validation configuration
export interface ValidationConfiguration {
  enabled: boolean;
  strictMode: boolean;
  cacheEnabled: boolean;
  cacheTTL: number;
  timeout: number;
  retryCount: number;
  retryDelay: number;
}

// Validation operation
export type ValidationOperation = 
  | { type: 'VALIDATE'; data: unknown; schemaId: string }
  | { type: 'VALIDATE_WORKFLOW'; workflow: unknown }
  | { type: 'VALIDATE_NODE'; node: unknown; schemaId: string }
  | { type: 'VALIDATE_EDGE'; edge: unknown; schemaId: string }
  | { type: 'VALIDATE_STATE'; state: unknown; schemaId: string }
  | { type: 'VALIDATE_TOOL'; tool: unknown; schemaId: string }
  | { type: 'REGISTER_VALIDATOR'; validator: Validator }
  | { type: 'REGISTER_SCHEMA'; schema: ValidationSchema }
  | { type: 'CLEAR_CACHE' };

// Validation state
export interface ValidationState {
  engine: ValidationEngine;
  results: Map<string, ValidationResult>;
  isLoading: boolean;
  error: string | null;
  configuration: ValidationConfiguration;
}

// Validation action
export type ValidationAction = 
  | { type: 'VALIDATE'; data: unknown; schemaId: string }
  | { type: 'VALIDATE_WORKFLOW'; workflow: unknown }
  | { type: 'VALIDATE_NODE'; node: unknown; schemaId: string }
  | { type: 'VALIDATE_EDGE'; edge: unknown; schemaId: string }
  | { type: 'VALIDATE_STATE'; state: unknown; schemaId: string }
  | { type: 'VALIDATE_TOOL'; tool: unknown; schemaId: string }
  | { type: 'REGISTER_VALIDATOR'; validator: Validator }
  | { type: 'REGISTER_SCHEMA'; schema: ValidationSchema }
  | { type: 'CLEAR_CACHE' }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'UPDATE_CONFIGURATION'; configuration: Partial<ValidationConfiguration> };