import type {
  StateKey,
  ConversationState,
  WorkflowStates,
  GlobalStates,
  StateChangeCallback,
  StateValidationResult,
  StateValidationError,
  StateValidationWarning,
} from '../types';

// State service interface
export interface StateService {
  // State management
  getState: (key: string, scope: string) => unknown;
  setState: (key: string, value: unknown, scope: string) => void;
  updateState: (key: string, updates: Record<string, unknown>, scope: string) => void;
  deleteState: (key: string, scope: string) => void;
  clearState: (scope: string) => void;
  hasState: (key: string, scope: string) => boolean;
  getAllStates: (scope: string) => Record<string, unknown>;

  // Conversation state management
  getConversationState: (workflowId: string) => Promise<ConversationState>;
  updateConversationState: (workflowId: string, updates: Partial<ConversationState>) => Promise<ConversationState>;
  addCompletedStep: (workflowId: string, step: string) => Promise<ConversationState>;
  setCurrentStep: (workflowId: string, step: string) => Promise<ConversationState>;

  // Workflow state management
  getWorkflowStates: (workflowId: string) => Promise<WorkflowStates>;
  updateWorkflowStates: (workflowId: string, updates: Partial<WorkflowStates>) => Promise<WorkflowStates>;

  // Global state management
  getGlobalStates: () => Promise<GlobalStates>;
  updateGlobalStates: (updates: Partial<GlobalStates>) => Promise<GlobalStates>;

  // State key management
  createStateKey: (key: StateKey) => Promise<StateKey>;
  updateStateKey: (keyId: string, updates: Partial<StateKey>) => Promise<StateKey>;
  deleteStateKey: (keyId: string) => Promise<boolean>;
  getStateKey: (keyId: string) => Promise<StateKey | null>;
  listStateKeys: () => Promise<StateKey[]>;

  // Validation
  validateState: (key: string, value: unknown, scope: string) => Promise<StateValidationResult>;
  validateStateKey: (stateKey: StateKey) => Promise<StateValidationResult>;

  // Subscriptions
  subscribe: (key: string, callback: StateChangeCallback, scope: string) => () => void;
  unsubscribe: (key: string, callback: StateChangeCallback, scope: string) => void;
}

// State service implementation
export class StateServiceImpl implements StateService {
  private states: Map<string, Record<string, unknown>> = new Map();
  private conversationStates: Map<string, ConversationState> = new Map();
  private workflowStates: Map<string, WorkflowStates> = new Map();
  private globalStates: GlobalStates = {
    conversationState: {
      currentWorkflow: '',
      previousWorkflow: '',
      completedWorkflows: [],
    },
    data: {},
  };
  private stateKeys: Map<string, StateKey> = new Map();
  private subscribers: Map<string, Set<StateChangeCallback>> = new Map();

  constructor() {
    this.initializeDefaultStates();
  }

  private initializeDefaultStates(): void {
    // Initialize with empty states
  }

  getState(key: string, scope: string): unknown {
    const scopeStates = this.states.get(scope) || {};
    return scopeStates[key];
  }

  setState(key: string, value: unknown, scope: string): void {
    const scopeStates = this.states.get(scope) || {};
    const oldValue = scopeStates[key];
    scopeStates[key] = value;
    this.states.set(scope, scopeStates);
    
    // Notify subscribers
    this.notifySubscribers(key, value, oldValue, scope);
  }

  updateState(key: string, updates: Record<string, unknown>, scope: string): void {
    const scopeStates = this.states.get(scope) || {};
    const currentValue = scopeStates[key] as Record<string, unknown> || {};
    const newValue = { ...currentValue, ...updates };
    const oldValue = scopeStates[key];
    
    scopeStates[key] = newValue;
    this.states.set(scope, scopeStates);
    
    // Notify subscribers
    this.notifySubscribers(key, newValue, oldValue, scope);
  }

  deleteState(key: string, scope: string): void {
    const scopeStates = this.states.get(scope) || {};
    const oldValue = scopeStates[key];
    delete scopeStates[key];
    this.states.set(scope, scopeStates);
    
    // Notify subscribers
    this.notifySubscribers(key, undefined, oldValue, scope);
  }

  clearState(scope: string): void {
    const scopeStates = this.states.get(scope) || {};
    const oldStates = { ...scopeStates };
    this.states.set(scope, {});
    
    // Notify subscribers for all cleared keys
    for (const [key, value] of Object.entries(oldStates)) {
      this.notifySubscribers(key, undefined, value, scope);
    }
  }

  hasState(key: string, scope: string): boolean {
    const scopeStates = this.states.get(scope) || {};
    return key in scopeStates;
  }

  getAllStates(scope: string): Record<string, unknown> {
    return this.states.get(scope) || {};
  }

  async getConversationState(workflowId: string): Promise<ConversationState> {
    return this.conversationStates.get(workflowId) || {
      currentStep: '',
      previousStep: '',
      completedSteps: [],
    };
  }

  async updateConversationState(workflowId: string, updates: Partial<ConversationState>): Promise<ConversationState> {
    const currentState = await this.getConversationState(workflowId);
    const updatedState = { ...currentState, ...updates };
    this.conversationStates.set(workflowId, updatedState);
    return updatedState;
  }

  async addCompletedStep(workflowId: string, step: string): Promise<ConversationState> {
    const currentState = await this.getConversationState(workflowId);
    const updatedState = {
      ...currentState,
      completedSteps: [...currentState.completedSteps, step],
    };
    this.conversationStates.set(workflowId, updatedState);
    return updatedState;
  }

  async setCurrentStep(workflowId: string, step: string): Promise<ConversationState> {
    const currentState = await this.getConversationState(workflowId);
    const updatedState = {
      ...currentState,
      previousStep: currentState.currentStep,
      currentStep: step,
    };
    this.conversationStates.set(workflowId, updatedState);
    return updatedState;
  }

  async getWorkflowStates(workflowId: string): Promise<WorkflowStates> {
    return this.workflowStates.get(workflowId) || {
      conversationState: {
        currentStep: '',
        previousStep: '',
        completedSteps: [],
      },
      data: {},
    };
  }

  async updateWorkflowStates(workflowId: string, updates: Partial<WorkflowStates>): Promise<WorkflowStates> {
    const currentStates = await this.getWorkflowStates(workflowId);
    const updatedStates = { ...currentStates, ...updates };
    this.workflowStates.set(workflowId, updatedStates);
    return updatedStates;
  }

  async getGlobalStates(): Promise<GlobalStates> {
    return this.globalStates;
  }

  async updateGlobalStates(updates: Partial<GlobalStates>): Promise<GlobalStates> {
    this.globalStates = { ...this.globalStates, ...updates };
    return this.globalStates;
  }

  async createStateKey(key: StateKey): Promise<StateKey> {
    this.stateKeys.set(key.id, key);
    return key;
  }

  async updateStateKey(keyId: string, updates: Partial<StateKey>): Promise<StateKey> {
    const currentKey = this.stateKeys.get(keyId);
    if (!currentKey) {
      throw new Error(`State key ${keyId} not found`);
    }

    const updatedKey = { ...currentKey, ...updates };
    this.stateKeys.set(keyId, updatedKey);
    return updatedKey;
  }

  async deleteStateKey(keyId: string): Promise<boolean> {
    return this.stateKeys.delete(keyId);
  }

  async getStateKey(keyId: string): Promise<StateKey | null> {
    return this.stateKeys.get(keyId) || null;
  }

  async listStateKeys(): Promise<StateKey[]> {
    return Array.from(this.stateKeys.values());
  }

  async validateState(key: string, value: unknown, _scope: string): Promise<StateValidationResult> {
    const errors: StateValidationError[] = [];
    const warnings: StateValidationWarning[] = [];

    // Basic validation
    if (value === undefined || value === null) {
      errors.push({
        key,
        message: 'State value cannot be null or undefined',
        severity: 'error',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async validateStateKey(stateKey: StateKey): Promise<StateValidationResult> {
    const errors: StateValidationError[] = [];
    const warnings: StateValidationWarning[] = [];

    // Basic validation
    if (!stateKey.id) {
      errors.push({
        key: 'id',
        message: 'State key ID is required',
        severity: 'error',
      });
    }

    if (stateKey.required && !stateKey.description) {
      warnings.push({
        key: 'description',
        message: 'Description is recommended for required state keys',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  subscribe(key: string, callback: StateChangeCallback, scope: string): () => void {
    const subscriptionKey = `${scope}:${key}`;
    const subscribers = this.subscribers.get(subscriptionKey) || new Set();
    subscribers.add(callback);
    this.subscribers.set(subscriptionKey, subscribers);

    return () => this.unsubscribe(key, callback, scope);
  }

  unsubscribe(key: string, callback: StateChangeCallback, scope: string): void {
    const subscriptionKey = `${scope}:${key}`;
    const subscribers = this.subscribers.get(subscriptionKey);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.subscribers.delete(subscriptionKey);
      }
    }
  }

  private notifySubscribers(key: string, value: unknown, oldValue: unknown, _scope: string): void {
    const subscriptionKey = `${_scope}:${key}`;
    const subscribers = this.subscribers.get(subscriptionKey);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(key, value, oldValue);
        } catch (error) {
          console.error('Error in state change callback:', error);
        }
      });
    }
  }
}