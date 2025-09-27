import type {
  Workflow,
  Node,
  Edge,
  WorkflowSummary,
  WorkflowEditor,
  WorkflowValidation,
  ValidationError,
  ValidationWarning,
  WorkflowOperation,
  Position,
} from '../types';

// Workflow service interface
export interface WorkflowService {
  // Workflow CRUD operations
  createWorkflow: (workflow: Workflow) => Promise<Workflow>;
  getWorkflow: (id: string) => Promise<Workflow | null>;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => Promise<Workflow>;
  deleteWorkflow: (id: string) => Promise<boolean>;
  listWorkflows: () => Promise<WorkflowSummary[]>;

  // Workflow operations
  applyOperation: (workflowId: string, operation: WorkflowOperation) => Promise<Workflow>;
  validateWorkflow: (workflow: Workflow) => Promise<WorkflowValidation>;
  exportWorkflow: (workflowId: string) => Promise<string>;
  importWorkflow: (workflowData: string) => Promise<Workflow>;

  // Node operations
  createNode: (workflowId: string, nodeName: string, node: Node, position: Position) => Promise<Workflow>;
  updateNode: (workflowId: string, nodeName: string, updates: Partial<Node>) => Promise<Workflow>;
  deleteNode: (workflowId: string, nodeName: string) => Promise<Workflow>;
  getNode: (workflowId: string, nodeName: string) => Promise<Node | null>;

  // Edge operations
  createEdge: (workflowId: string, nodeName: string, edge: Edge) => Promise<Workflow>;
  updateEdge: (workflowId: string, nodeName: string, edgeIndex: number, updates: Partial<Edge>) => Promise<Workflow>;
  deleteEdge: (workflowId: string, nodeName: string, edgeIndex: number) => Promise<Workflow>;
  getEdge: (workflowId: string, nodeName: string, edgeIndex: number) => Promise<Edge | null>;

  // Editor operations
  getEditorState: (workflowId: string) => Promise<WorkflowEditor>;
  updateEditorState: (workflowId: string, updates: Partial<WorkflowEditor>) => Promise<WorkflowEditor>;
  selectNode: (workflowId: string, nodeName: string | null) => Promise<WorkflowEditor>;
  selectEdge: (workflowId: string, nodeName: string, edgeIndex: number | null) => Promise<WorkflowEditor>;
  updateViewport: (workflowId: string, viewport: { x: number; y: number; zoom: number }) => Promise<WorkflowEditor>;

  // Utility operations
  duplicateWorkflow: (workflowId: string, newName: string) => Promise<Workflow>;
  getWorkflowSummary: (workflowId: string) => Promise<WorkflowSummary>;
}

// Workflow service implementation
export class WorkflowServiceImpl implements WorkflowService {
  private workflows: Map<string, Workflow> = new Map();
  private editorStates: Map<string, WorkflowEditor> = new Map();

  constructor() {
    this.initializeDefaultWorkflows();
  }

  private initializeDefaultWorkflows(): void {
    // Initialize with empty state
  }

  async createWorkflow(workflow: Workflow): Promise<Workflow> {
    this.workflows.set(workflow.name, workflow);
    return workflow;
  }

  async getWorkflow(id: string): Promise<Workflow | null> {
    return this.workflows.get(id) || null;
  }

  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow> {
    const workflow = this.workflows.get(id);
    if (!workflow) {
      throw new Error(`Workflow ${id} not found`);
    }

    const updatedWorkflow = { ...workflow, ...updates };
    this.workflows.set(id, updatedWorkflow);
    return updatedWorkflow;
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    return this.workflows.delete(id);
  }

  async listWorkflows(): Promise<WorkflowSummary[]> {
    return Array.from(this.workflows.values()).map(workflow => ({
      name: workflow.name,
      workflows: workflow.summary.workflows,
    }));
  }

  async applyOperation(workflowId: string, operation: WorkflowOperation): Promise<Workflow> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    let updatedWorkflow = { ...workflow };

    switch (operation.type) {
      case 'CREATE_NODE':
        updatedWorkflow.nodes[operation.nodeName] = {
          ...operation.node,
          position: operation.position,
        };
        break;

      case 'UPDATE_NODE':
        if (updatedWorkflow.nodes[operation.nodeName]) {
          updatedWorkflow.nodes[operation.nodeName] = {
            ...updatedWorkflow.nodes[operation.nodeName],
            ...operation.updates,
          };
        }
        break;

      case 'DELETE_NODE':
        delete updatedWorkflow.nodes[operation.nodeName];
        break;

      case 'CREATE_EDGE':
        if (updatedWorkflow.nodes[operation.nodeName]) {
          if (!updatedWorkflow.nodes[operation.nodeName].edges) {
            updatedWorkflow.nodes[operation.nodeName].edges = [];
          }
          updatedWorkflow.nodes[operation.nodeName].edges!.push(operation.edge);
        }
        break;

      case 'UPDATE_EDGE':
        if (updatedWorkflow.nodes[operation.nodeName]?.edges?.[operation.edgeIndex]) {
          updatedWorkflow.nodes[operation.nodeName].edges![operation.edgeIndex] = {
            ...updatedWorkflow.nodes[operation.nodeName].edges![operation.edgeIndex],
            ...operation.updates,
          };
        }
        break;

      case 'DELETE_EDGE':
        if (updatedWorkflow.nodes[operation.nodeName]?.edges) {
          updatedWorkflow.nodes[operation.nodeName].edges!.splice(operation.edgeIndex, 1);
        }
        break;

      case 'UPDATE_WORKFLOW':
        updatedWorkflow = { ...updatedWorkflow, ...operation.updates };
        break;

      case 'SELECT_NODE':
        const editorState = this.editorStates.get(workflowId) || this.createDefaultEditorState();
        editorState.selectedNode = operation.nodeName;
        this.editorStates.set(workflowId, editorState);
        break;

      case 'SELECT_EDGE':
        const editorState2 = this.editorStates.get(workflowId) || this.createDefaultEditorState();
        editorState2.selectedEdge = operation.nodeName;
        this.editorStates.set(workflowId, editorState2);
        break;

      case 'UPDATE_VIEWPORT':
        const editorState3 = this.editorStates.get(workflowId) || this.createDefaultEditorState();
        editorState3.viewport = operation.viewport;
        this.editorStates.set(workflowId, editorState3);
        break;
    }

    this.workflows.set(workflowId, updatedWorkflow);
    return updatedWorkflow;
  }

  async validateWorkflow(workflow: Workflow): Promise<WorkflowValidation> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Basic validation
    if (!workflow.name) {
      errors.push({
        field: 'name',
        message: 'Workflow name is required',
        severity: 'error',
      });
    }

    if (!workflow.description) {
      warnings.push({
        field: 'description',
        message: 'Workflow description is recommended',
      });
    }

    if (!workflow.nodes || Object.keys(workflow.nodes).length === 0) {
      errors.push({
        field: 'nodes',
        message: 'Workflow must have at least one node',
        severity: 'error',
      });
    }

    // Validate nodes
    for (const [nodeName, node] of Object.entries(workflow.nodes)) {
      if (!node.prompt) {
        errors.push({
          field: `nodes.${nodeName}.prompt`,
          message: 'Node prompt is required',
          severity: 'error',
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async exportWorkflow(workflowId: string): Promise<string> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    return JSON.stringify(workflow, null, 2);
  }

  async importWorkflow(workflowData: string): Promise<Workflow> {
    try {
      const workflow = JSON.parse(workflowData) as Workflow;
      const validation = await this.validateWorkflow(workflow);
      
      if (!validation.valid) {
        throw new Error('Invalid workflow data');
      }

      this.workflows.set(workflow.name, workflow);
      return workflow;
    } catch (error) {
      throw new Error('Failed to import workflow: ' + (error as Error).message);
    }
  }

  async createNode(workflowId: string, nodeName: string, node: Node, position: Position): Promise<Workflow> {
    return this.applyOperation(workflowId, {
      type: 'CREATE_NODE',
      nodeName,
      node,
      position,
    });
  }

  async updateNode(workflowId: string, nodeName: string, updates: Partial<Node>): Promise<Workflow> {
    return this.applyOperation(workflowId, {
      type: 'UPDATE_NODE',
      nodeName,
      updates,
    });
  }

  async deleteNode(workflowId: string, nodeName: string): Promise<Workflow> {
    return this.applyOperation(workflowId, {
      type: 'DELETE_NODE',
      nodeName,
    });
  }

  async getNode(workflowId: string, nodeName: string): Promise<Node | null> {
    const workflow = this.workflows.get(workflowId);
    return workflow?.nodes[nodeName] || null;
  }

  async createEdge(workflowId: string, nodeName: string, edge: Edge): Promise<Workflow> {
    return this.applyOperation(workflowId, {
      type: 'CREATE_EDGE',
      nodeName,
      edge,
    });
  }

  async updateEdge(workflowId: string, nodeName: string, edgeIndex: number, updates: Partial<Edge>): Promise<Workflow> {
    return this.applyOperation(workflowId, {
      type: 'UPDATE_EDGE',
      nodeName,
      edgeIndex,
      updates,
    });
  }

  async deleteEdge(workflowId: string, nodeName: string, edgeIndex: number): Promise<Workflow> {
    return this.applyOperation(workflowId, {
      type: 'DELETE_EDGE',
      nodeName,
      edgeIndex,
    });
  }

  async getEdge(workflowId: string, nodeName: string, edgeIndex: number): Promise<Edge | null> {
    const workflow = this.workflows.get(workflowId);
    return workflow?.nodes[nodeName]?.edges?.[edgeIndex] || null;
  }

  async getEditorState(workflowId: string): Promise<WorkflowEditor> {
    return this.editorStates.get(workflowId) || this.createDefaultEditorState();
  }

  async updateEditorState(workflowId: string, updates: Partial<WorkflowEditor>): Promise<WorkflowEditor> {
    const currentState = this.editorStates.get(workflowId) || this.createDefaultEditorState();
    const updatedState = { ...currentState, ...updates };
    this.editorStates.set(workflowId, updatedState);
    return updatedState;
  }

  async selectNode(workflowId: string, nodeName: string | null): Promise<WorkflowEditor> {
    await this.applyOperation(workflowId, {
      type: 'SELECT_NODE',
      nodeName,
    });
    return this.getEditorState(workflowId);
  }

  async selectEdge(workflowId: string, nodeName: string, edgeIndex: number | null): Promise<WorkflowEditor> {
    await this.applyOperation(workflowId, {
      type: 'SELECT_EDGE',
      nodeName,
      edgeIndex,
    });
    return this.getEditorState(workflowId);
  }

  async updateViewport(workflowId: string, viewport: { x: number; y: number; zoom: number }): Promise<WorkflowEditor> {
    await this.applyOperation(workflowId, {
      type: 'UPDATE_VIEWPORT',
      viewport,
    });
    return this.getEditorState(workflowId);
  }

  async duplicateWorkflow(workflowId: string, newName: string): Promise<Workflow> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const duplicatedWorkflow: Workflow = {
      ...workflow,
      name: newName,
    };

    this.workflows.set(newName, duplicatedWorkflow);
    return duplicatedWorkflow;
  }

  async getWorkflowSummary(workflowId: string): Promise<WorkflowSummary> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    return workflow.summary;
  }

  private createDefaultEditorState(): WorkflowEditor {
    return {
      currentWorkflow: null,
      selectedNode: null,
      selectedEdge: null,
      viewport: { x: 0, y: 0, zoom: 1 },
      isDirty: false,
      lastSaved: null,
    };
  }
}
