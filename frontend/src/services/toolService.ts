import type {
  Tool,
  ToolExecutionContext,
  ToolExecutionResult,
  ToolValidationResult,
  ToolValidationError,
  ToolValidationWarning,
  ToolConfiguration,
  ToolOperation,
  ToolState,
  ToolExecution,
} from '../types';

// Tool service interface
export interface ToolService {
  // Tool management
  registerTool: (tool: Tool) => Promise<void>;
  unregisterTool: (toolId: string) => Promise<void>;
  getTool: (toolId: string) => Promise<Tool | null>;
  listTools: () => Promise<Tool[]>;
  searchTools: (query: string) => Promise<Tool[]>;

  // Tool execution
  executeTool: (toolId: string, parameters: Record<string, unknown>, context: ToolExecutionContext) => Promise<ToolExecutionResult>;
  validateTool: (tool: Tool) => Promise<ToolValidationResult>;
  validateParameters: (toolId: string, parameters: Record<string, unknown>) => Promise<ToolValidationResult>;

  // Tool operations
  applyOperation: (operation: ToolOperation) => Promise<void>;
  getToolState: () => Promise<ToolState>;
  updateConfiguration: (configuration: Partial<ToolConfiguration>) => Promise<void>;

  // Core tools
  getState: (key: string, context: ToolExecutionContext) => Promise<ToolExecutionResult>;
  updateState: (key: string, value: unknown, context: ToolExecutionContext) => Promise<ToolExecutionResult>;
  chooseScenario: (scenarios: string[], context: ToolExecutionContext) => Promise<ToolExecutionResult>;
  nextNode: (nodeName: string, context: ToolExecutionContext) => Promise<ToolExecutionResult>;
}

// Tool service implementation
export class ToolServiceImpl implements ToolService {
  private tools: Map<string, Tool> = new Map();
  private executions: Map<string, ToolExecution> = new Map();
  private configuration: ToolConfiguration = {
    enabled: true,
    timeout: 30000,
    retryCount: 3,
    retryDelay: 1000,
    cacheEnabled: true,
    cacheTTL: 300000,
    permissions: [],
    environment: {},
  };

  constructor() {
    this.initializeCoreTools();
  }

  private initializeCoreTools(): void {
    // Initialize core tools
    const coreTools: Tool[] = [
      {
        name: 'getState',
        description: 'Get the value of a state key',
        parameters: [
          {
            id: 'key',
            type: 'string',
            required: true,
          },
        ],
      },
      {
        name: 'updateState',
        description: 'Update the value of a state key',
        parameters: [
          {
            id: 'key',
            type: 'string',
            required: true,
          },
          {
            id: 'value',
            type: 'any',
            required: true,
          },
        ],
      },
      {
        name: 'chooseScenario',
        description: 'Choose from available scenarios',
        parameters: [
          {
            id: 'scenarios',
            type: 'array',
            required: true,
          },
        ],
      },
      {
        name: 'executeTool',
        description: 'Execute another tool',
        parameters: [
          {
            id: 'toolId',
            type: 'string',
            required: true,
          },
          {
            id: 'parameters',
            type: 'object',
            required: true,
          },
        ],
      },
      {
        name: 'nextNode',
        description: 'Move to the next node in the workflow',
        parameters: [
          {
            id: 'nodeName',
            type: 'string',
            required: true,
          },
        ],
      },
    ];

    coreTools.forEach(tool => {
      this.tools.set(tool.name, tool);
    });
  }

  async registerTool(tool: Tool): Promise<void> {
    this.tools.set(tool.name, tool);
  }

  async unregisterTool(toolId: string): Promise<void> {
    this.tools.delete(toolId);
  }

  async getTool(toolId: string): Promise<Tool | null> {
    return this.tools.get(toolId) || null;
  }

  async listTools(): Promise<Tool[]> {
    return Array.from(this.tools.values());
  }

  async searchTools(query: string): Promise<Tool[]> {
    const tools = Array.from(this.tools.values());
    return tools.filter(tool => 
      tool.name.toLowerCase().includes(query.toLowerCase()) ||
      tool.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  async executeTool(toolId: string, parameters: Record<string, unknown>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const tool = this.tools.get(toolId);
    if (!tool) {
      return {
        success: false,
        error: {
          code: 'TOOL_NOT_FOUND',
          message: `Tool ${toolId} not found`,
          recoverable: false,
        },
        metadata: {
          duration: 0,
          memoryUsage: 0,
          retries: 0,
        },
      };
    }

    // Validate parameters
    const validation = await this.validateParameters(toolId, parameters);
    if (!validation.valid) {
      return {
        success: false,
        error: {
          code: 'INVALID_PARAMETERS',
          message: 'Invalid parameters provided',
          recoverable: true,
        },
        metadata: {
          duration: 0,
          memoryUsage: 0,
          retries: 0,
        },
      };
    }

    // Execute core tools
    switch (toolId) {
      case 'getState':
        return this.getState(parameters.key as string, context);
      case 'updateState':
        return this.updateState(parameters.key as string, parameters.value, context);
      case 'chooseScenario':
        return this.chooseScenario(parameters.scenarios as string[], context);
      case 'executeTool':
        return this.executeTool(parameters.toolId as string, parameters.parameters as Record<string, unknown>, context);
      case 'nextNode':
        return this.nextNode(parameters.nodeName as string, context);
      default:
        return {
          success: false,
          error: {
            code: 'UNKNOWN_TOOL',
            message: `Unknown tool: ${toolId}`,
            recoverable: false,
          },
          metadata: {
            duration: 0,
            memoryUsage: 0,
            retries: 0,
          },
        };
    }
  }

  async validateTool(tool: Tool): Promise<ToolValidationResult> {
    const errors: ToolValidationError[] = [];
    const warnings: ToolValidationWarning[] = [];

    if (!tool.name) {
      errors.push({
        field: 'name',
        message: 'Tool name is required',
        severity: 'error',
      });
    }

    if (!tool.description) {
      warnings.push({
        field: 'description',
        message: 'Tool description is recommended',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async validateParameters(toolId: string, parameters: Record<string, unknown>): Promise<ToolValidationResult> {
    const tool = this.tools.get(toolId);
    if (!tool) {
      return {
        valid: false,
        errors: [{
          field: 'toolId',
          message: 'Tool not found',
          severity: 'error',
        }],
        warnings: [],
      };
    }

    const errors: ToolValidationError[] = [];
    const warnings: ToolValidationWarning[] = [];

    if (tool.parameters) {
      for (const param of tool.parameters) {
        if (param.required && !(param.id in parameters)) {
          errors.push({
            field: param.id,
            message: `Required parameter ${param.id} is missing`,
            severity: 'error',
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async applyOperation(operation: ToolOperation): Promise<void> {
    switch (operation.type) {
      case 'EXECUTE':
        await this.executeTool(operation.toolId, operation.parameters, {
          toolId: operation.toolId,
          parameters: operation.parameters,
          state: {},
          workflow: '',
          node: '',
          user: '',
          session: '',
          metadata: {
            requestId: '',
            timestamp: new Date(),
            timeout: this.configuration.timeout,
            retryCount: 0,
            priority: 0,
            tags: [],
          },
        });
        break;
      case 'VALIDATE':
        await this.validateParameters(operation.toolId, operation.parameters);
        break;
      case 'CANCEL':
        this.executions.delete(operation.executionId);
        break;
      case 'RETRY':
        // Retry logic would go here
        break;
    }
  }

  async getToolState(): Promise<ToolState> {
    return {
      tools: this.tools,
      executions: this.executions,
      configuration: this.configuration,
      registry: {
        tools: this.tools,
        register: (tool: Tool) => this.registerTool(tool),
        unregister: (toolId: string) => this.unregisterTool(toolId),
        getTool: async (toolId: string) => this.getTool(toolId),
        searchTools: async (query: string) => this.searchTools(query),
        validateTool: async (tool: Tool) => this.validateTool(tool),
      },
      executor: {
        execute: async (context: ToolExecutionContext) => this.executeTool(context.toolId, context.parameters, context),
        validate: async (tool: Tool, parameters: Record<string, unknown>) => this.validateParameters(tool.name, parameters),
        canExecute: async (_tool: Tool, _context: ToolExecutionContext) => true,
      },
      isLoading: false,
      error: null,
    };
  }

  async updateConfiguration(configuration: Partial<ToolConfiguration>): Promise<void> {
    this.configuration = { ...this.configuration, ...configuration };
  }

  // Core tool implementations
  async getState(_key: string, _context: ToolExecutionContext): Promise<ToolExecutionResult> {
    // This would typically interact with the state service
    return {
      success: true,
      result: null,
      metadata: {
        duration: 0,
        memoryUsage: 0,
        retries: 0,
      },
    };
  }

  async updateState(_key: string, value: unknown, _context: ToolExecutionContext): Promise<ToolExecutionResult> {
    // This would typically interact with the state service
    return {
      success: true,
      result: value,
      metadata: {
        duration: 0,
        memoryUsage: 0,
        retries: 0,
      },
    };
  }

  async chooseScenario(scenarios: string[], _context: ToolExecutionContext): Promise<ToolExecutionResult> {
    // Simple scenario selection logic
    const selectedScenario = scenarios[0] || 'default';
    return {
      success: true,
      result: selectedScenario,
      metadata: {
        duration: 0,
        memoryUsage: 0,
        retries: 0,
      },
    };
  }

  async nextNode(nodeName: string, _context: ToolExecutionContext): Promise<ToolExecutionResult> {
    // This would typically update the workflow state
    return {
      success: true,
      result: nodeName,
      metadata: {
        duration: 0,
        memoryUsage: 0,
        retries: 0,
      },
    };
  }
}