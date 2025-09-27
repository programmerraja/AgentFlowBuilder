# Data Model: Workflow Builder UI

**Feature**: Workflow Builder UI  
**Date**: 2024-12-19  
**Phase**: 1 - Design & Contracts

## Core Entities

### Workflow
**Purpose**: Represents a complete business process with nodes, state, and execution rules

**Fields**:
- `id: string` - Unique identifier
- `name: string` - Human-readable name
- `description: string` - Workflow description
- `version: string` - Version number (semantic versioning)
- `createdAt: Date` - Creation timestamp
- `updatedAt: Date` - Last modification timestamp
- `requiredWorkflows: string[]` - Prerequisite workflow IDs
- `nodes: Record<string, Node>` - Node definitions keyed by node ID
- `states: WorkflowStates` - State management configuration
- `summary: WorkflowSummary` - High-level workflow overview

**Validation Rules**:
- Name must be non-empty and unique
- At least one node must exist
- Node IDs must be unique within workflow
- Required workflows must reference valid workflow IDs

**State Transitions**:
- `draft` → `validated` → `published`
- `published` → `archived`
- `archived` → `draft`

### Node
**Purpose**: Individual step within a workflow representing specific interaction points

**Fields**:
- `id: string` - Unique node identifier
- `name: string` - Node name
- `label?: string` - Display label
- `isFirstNode: boolean` - Entry point flag
- `prompt: string` - LLM instruction text
- `preAction: string[]` - Actions executed before node
- `postAction: string[]` - Actions executed after node
- `tools: Tool[]` - Available tools for this node
- `stateKeys: StateKey[]` - Required/optional state data
- `edges: Edge[]` - Conditional navigation rules
- `position: Position` - Visual position in editor
- `type: NodeType` - Node category (input, process, output, decision)

**Validation Rules**:
- ID must be unique within workflow
- Prompt must be non-empty
- State keys must reference valid state definitions
- Edges must reference valid target nodes

**Node Types**:
- `input` - Data collection nodes
- `process` - Processing/transformation nodes
- `output` - Result/output nodes
- `decision` - Conditional branching nodes

### StateKey
**Purpose**: Data elements that track information throughout workflow execution

**Fields**:
- `id: string` - State key identifier
- `required: boolean` - Whether data is mandatory
- `description?: string` - Human-readable description
- `type: StateType` - Data type (string, number, boolean, object, array)
- `nodeAffects?: NodeAffect` - Dependent node configuration
- `validation?: ValidationRule[]` - Data validation rules

**Validation Rules**:
- ID must be unique within workflow
- Type must be valid StateType
- Node affects must reference valid nodes

### Tool
**Purpose**: External system integration functions that workflows can call

**Fields**:
- `name: string` - Tool identifier
- `description: string` - Tool purpose description
- `parameters: ToolParameter[]` - Input parameters
- `returnType: string` - Expected return type
- `mockResponse?: any` - Mock response for testing

**Validation Rules**:
- Name must be unique within node
- Parameters must have valid types
- Description must be non-empty

### ToolParameter
**Purpose**: Input parameter definition for tools

**Fields**:
- `id: string` - Parameter identifier
- `type: string` - Parameter type
- `required: boolean` - Whether parameter is mandatory
- `description?: string` - Parameter description
- `defaultValue?: any` - Default value

### Edge
**Purpose**: Conditional navigation between nodes

**Fields**:
- `nodeName: string` - Target node ID
- `condition: string` - Navigation condition
- `stateKeys: string[]` - Required state values
- `label?: string` - Display label for edge

**Validation Rules**:
- Target node must exist
- State keys must be valid
- Condition must be non-empty

### WorkflowStates
**Purpose**: State management configuration for workflow

**Fields**:
- `conversationState: ConversationState` - Conversation tracking
- `data: Record<string, any>` - Data state storage
- `stateKeyValueMap: Record<string, string>` - State key mappings

### ConversationState
**Purpose**: Tracks conversation progress and navigation

**Fields**:
- `currentStep: string` - Currently active node
- `previousStep: string` - Previously completed node
- `completedSteps: string[]` - Array of completed nodes
- `currentWorkflow?: string` - Active workflow ID
- `previousWorkflow?: string` - Previous workflow ID
- `completedWorkflows: string[]` - Completed workflow IDs

### WorkflowSummary
**Purpose**: High-level workflow overview for visualization

**Fields**:
- `name: string` - Workflow name
- `workflows: Record<string, WorkflowNodeSummary>` - Node summaries
- `totalNodes: number` - Total node count
- `complexity: ComplexityLevel` - Workflow complexity rating

### WorkflowNodeSummary
**Purpose**: Node summary for workflow overview

**Fields**:
- `action: string` - Node action description
- `dependsOn: string[]` - Dependent node IDs
- `next: string[]` - Next possible node IDs

## UI-Specific Entities

### WorkflowEditor
**Purpose**: Main editor state and configuration

**Fields**:
- `selectedWorkflow: string | null` - Currently selected workflow
- `selectedNode: string | null` - Currently selected node
- `zoom: number` - Canvas zoom level
- `pan: Position` - Canvas pan position
- `mode: EditorMode` - Current editor mode
- `validationErrors: ValidationError[]` - Current validation errors

**Editor Modes**:
- `edit` - Normal editing mode
- `test` - Testing/simulation mode
- `view` - Read-only viewing mode

### ValidationError
**Purpose**: Workflow validation error information

**Fields**:
- `id: string` - Error identifier
- `type: ErrorType` - Error category
- `message: string` - Error description
- `nodeId?: string` - Related node ID
- `field?: string` - Related field name
- `severity: ErrorSeverity` - Error importance level

**Error Types**:
- `validation` - Data validation errors
- `connection` - Node connection errors
- `dependency` - Workflow dependency errors
- `schema` - JSON schema errors

**Error Severity**:
- `error` - Blocking errors
- `warning` - Non-blocking issues
- `info` - Informational messages
## Data Relationships

### Workflow → Node (1:many)
- One workflow contains multiple nodes
- Nodes are owned by a single workflow
- Deleting workflow removes all nodes

### Node → StateKey (1:many)
- One node can have multiple state keys
- State keys are scoped to their node
- State keys can reference other nodes

### Node → Tool (1:many)
- One node can have multiple tools
- Tools are scoped to their node
- Tools can be shared across nodes

### Node → Edge (1:many)
- One node can have multiple outgoing edges
- Edges connect nodes within the same workflow
- Edges define conditional navigation

### Workflow → TestCase (1:many)
- One workflow can have multiple test cases
- Test cases are owned by a single workflow
- Deleting workflow removes all test cases

## State Management Patterns

### Immutable Updates
- All state changes create new objects
- Use immer for complex state updates
- Prevent direct mutation of state

### Normalized Data
- Entities stored by ID in maps
- Relationships maintained through IDs
- Efficient updates and lookups

### Validation Pipeline
- Schema validation on import
- Real-time validation during editing
- Comprehensive validation before export

### Undo/Redo Support
- State snapshots for each action
- Command pattern for reversible actions
- Limited history size for memory efficiency

## Data Persistence

### Local Storage
- Workflow definitions stored locally
- User preferences and settings
- Recent files and history

### File Operations
- JSON export/import for workflows
- Test case export/import
- Template library management

### Data Migration
- Version-based migration for schema changes
- Backward compatibility for older formats
- Graceful handling of invalid data
