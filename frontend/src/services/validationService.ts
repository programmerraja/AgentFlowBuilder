import type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  WorkflowValidation,
  NodeValidation,
  EdgeValidation,
  StateValidation,
  ToolValidation,
  ValidationSchema,
  Validator,
  ValidationConfiguration,
  ValidationOperation,
  ValidationState,
} from '../types';

// Validation service interface
export interface ValidationService {
  // Validation operations
  validate: (data: unknown, schemaId: string) => Promise<ValidationResult>;
  validateWorkflow: (workflow: unknown) => Promise<WorkflowValidation>;
  validateNode: (node: unknown, schemaId: string) => Promise<NodeValidation>;
  validateEdge: (edge: unknown, schemaId: string) => Promise<EdgeValidation>;
  validateState: (state: unknown, schemaId: string) => Promise<StateValidation>;
  validateTool: (tool: unknown, schemaId: string) => Promise<ToolValidation>;

  // Schema management
  registerSchema: (schema: ValidationSchema) => Promise<void>;
  unregisterSchema: (schemaId: string) => Promise<void>;
  getSchema: (schemaId: string) => Promise<ValidationSchema | null>;
  listSchemas: () => Promise<ValidationSchema[]>;

  // Validator management
  registerValidator: (validator: Validator) => Promise<void>;
  unregisterValidator: (validatorId: string) => Promise<void>;
  getValidator: (validatorId: string) => Promise<Validator | null>;
  listValidators: () => Promise<Validator[]>;

  // Configuration
  updateConfiguration: (configuration: Partial<ValidationConfiguration>) => Promise<void>;
  getConfiguration: () => Promise<ValidationConfiguration>;

  // Operations
  applyOperation: (operation: ValidationOperation) => Promise<void>;
  getValidationState: () => Promise<ValidationState>;
}

// Validation service implementation
export class ValidationServiceImpl implements ValidationService {
  private schemas: Map<string, ValidationSchema> = new Map();
  private validators: Map<string, Validator> = new Map();
  private results: Map<string, ValidationResult> = new Map();
  private configuration: ValidationConfiguration = {
    enabled: true,
    strictMode: false,
    cacheEnabled: true,
    cacheTTL: 300000,
    timeout: 30000,
    retryCount: 3,
    retryDelay: 1000,
  };

  constructor() {
    this.initializeDefaultSchemas();
  }

  private initializeDefaultSchemas(): void {
    // Initialize with basic schemas
    const workflowSchema: ValidationSchema = {
      id: 'workflow',
      name: 'Workflow Schema',
      type: 'workflow',
      version: '1.0.0',
      schema: {
        type: 'object',
        required: ['name', 'description', 'nodes', 'states', 'summary'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          nodes: { type: 'object' },
          states: { type: 'object' },
          summary: { type: 'object' },
        },
      },
    };

    this.schemas.set('workflow', workflowSchema);
  }

  async validate(data: unknown, schemaId: string): Promise<ValidationResult> {
    const schema = this.schemas.get(schemaId);
    if (!schema) {
      return {
        valid: false,
        errors: [{
          field: 'schema',
          message: `Schema ${schemaId} not found`,
          severity: 'error',
        }],
        warnings: [],
      };
    }

    // Basic validation logic
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (typeof data !== 'object' || data === null) {
      errors.push({
        field: 'root',
        message: 'Data must be an object',
        severity: 'error',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async validateWorkflow(workflow: unknown): Promise<WorkflowValidation> {
    const result = await this.validate(workflow, 'workflow');
    return {
      valid: result.valid,
      errors: result.errors,
      warnings: result.warnings,
    };
  }

  async validateNode(node: unknown, schemaId: string): Promise<NodeValidation> {
    const result = await this.validate(node, schemaId);
    return {
      valid: result.valid,
      errors: result.errors.map(err => ({
        field: err.field,
        message: err.message,
        severity: err.severity,
        code: err.code,
      })),
      warnings: result.warnings.map(warn => ({
        field: warn.field,
        message: warn.message,
        suggestion: warn.suggestion,
      })),
    };
  }

  async validateEdge(edge: unknown, schemaId: string): Promise<EdgeValidation> {
    const result = await this.validate(edge, schemaId);
    return {
      valid: result.valid,
      errors: result.errors,
      warnings: result.warnings,
    };
  }

  async validateState(state: unknown, schemaId: string): Promise<StateValidation> {
    const result = await this.validate(state, schemaId);
    return {
      valid: result.valid,
      errors: result.errors,
      warnings: result.warnings,
    };
  }

  async validateTool(tool: unknown, schemaId: string): Promise<ToolValidation> {
    const result = await this.validate(tool, schemaId);
    return {
      valid: result.valid,
      errors: result.errors,
      warnings: result.warnings,
    };
  }

  async registerSchema(schema: ValidationSchema): Promise<void> {
    this.schemas.set(schema.id, schema);
  }

  async unregisterSchema(schemaId: string): Promise<void> {
    this.schemas.delete(schemaId);
  }

  async getSchema(schemaId: string): Promise<ValidationSchema | null> {
    return this.schemas.get(schemaId) || null;
  }

  async listSchemas(): Promise<ValidationSchema[]> {
    return Array.from(this.schemas.values());
  }

  async registerValidator(validator: Validator): Promise<void> {
    this.validators.set(validator.id, validator);
  }

  async unregisterValidator(validatorId: string): Promise<void> {
    this.validators.delete(validatorId);
  }

  async getValidator(validatorId: string): Promise<Validator | null> {
    return this.validators.get(validatorId) || null;
  }

  async listValidators(): Promise<Validator[]> {
    return Array.from(this.validators.values());
  }

  async updateConfiguration(configuration: Partial<ValidationConfiguration>): Promise<void> {
    this.configuration = { ...this.configuration, ...configuration };
  }

  async getConfiguration(): Promise<ValidationConfiguration> {
    return this.configuration;
  }

  async applyOperation(operation: ValidationOperation): Promise<void> {
    switch (operation.type) {
      case 'VALIDATE':
        await this.validate(operation.data, operation.schemaId);
        break;
      case 'VALIDATE_WORKFLOW':
        await this.validateWorkflow(operation.workflow);
        break;
      case 'VALIDATE_NODE':
        await this.validateNode(operation.node, operation.schemaId);
        break;
      case 'VALIDATE_EDGE':
        await this.validateEdge(operation.edge, operation.schemaId);
        break;
      case 'VALIDATE_STATE':
        await this.validateState(operation.state, operation.schemaId);
        break;
      case 'VALIDATE_TOOL':
        await this.validateTool(operation.tool, operation.schemaId);
        break;
      case 'REGISTER_VALIDATOR':
        await this.registerValidator(operation.validator);
        break;
      case 'REGISTER_SCHEMA':
        await this.registerSchema(operation.schema);
        break;
      case 'CLEAR_CACHE':
        this.results.clear();
        break;
    }
  }

  async getValidationState(): Promise<ValidationState> {
    return {
      engine: {
        validators: this.validators,
        schemas: this.schemas,
        registerValidator: (validator: Validator) => this.registerValidator(validator),
        registerSchema: (schema: ValidationSchema) => this.registerSchema(schema),
        validate: async (data: unknown, schemaId: string) => this.validate(data, schemaId),
        validateWorkflow: async (workflow: unknown) => this.validateWorkflow(workflow),
        validateNode: async (node: unknown, schemaId: string) => this.validateNode(node, schemaId),
        validateEdge: async (edge: unknown, schemaId: string) => this.validateEdge(edge, schemaId),
        validateState: async (state: unknown, schemaId: string) => this.validateState(state, schemaId),
        validateTool: async (tool: unknown, schemaId: string) => this.validateTool(tool, schemaId),
      },
      results: this.results,
      isLoading: false,
      error: null,
      configuration: this.configuration,
    };
  }
}