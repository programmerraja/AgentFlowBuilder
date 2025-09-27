# Tasks: Workflow Builder UI

**Input**: Design documents from `/specs/001-we-need-to/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `frontend/src/`, `frontend/tests/` at repository root
- Paths based on plan.md structure: frontend-focused web application

## Phase 3.1: Setup
- [ ] T001 Create frontend project structure per implementation plan
- [ ] T002 Initialize React + TypeScript project with Vite
- [ ] T003 [P] Install and configure React Flow, Monaco Editor, Ajv dependencies
- [ ] T004 [P] Configure ESLint, Prettier, and TypeScript settings
- [ ] T005 [P] Set up testing framework (Jest + React Testing Library)

## Phase 3.2: Type Definitions
- [ ] T006 [P] Workflow types in frontend/src/types/workflow.ts
- [ ] T007 [P] Node types in frontend/src/types/node.ts
- [ ] T008 [P] State types in frontend/src/types/state.ts
- [ ] T009 [P] Tool types in frontend/src/types/tool.ts
- [ ] T010 [P] Validation types in frontend/src/types/validation.ts

## Phase 3.3: Service Layer
- [ ] T011 [P] Workflow service in frontend/src/services/workflowService.ts
- [ ] T012 [P] Validation service in frontend/src/services/validationService.ts
- [ ] T013 [P] Export service in frontend/src/services/exportService.ts
- [ ] T014 [P] JSON schema utilities in frontend/src/utils/jsonSchema.ts
- [ ] T015 [P] Workflow parser utilities in frontend/src/utils/workflowParser.ts

## Phase 3.4: Core UI Components
- [ ] T016 [P] WorkflowEditor component in frontend/src/components/WorkflowEditor/WorkflowEditor.tsx
- [ ] T017 [P] NodeEditor component in frontend/src/components/NodeEditor/NodeEditor.tsx
- [ ] T018 [P] StateManager component in frontend/src/components/StateManager/StateManager.tsx
- [ ] T019 [P] ToolConfig component in frontend/src/components/ToolConfig/ToolConfig.tsx
- [ ] T020 [P] WorkflowCanvas component in frontend/src/components/WorkflowEditor/WorkflowCanvas.tsx
- [ ] T021 [P] NodePalette component in frontend/src/components/WorkflowEditor/NodePalette.tsx
- [ ] T022 [P] ValidationPanel component in frontend/src/components/WorkflowEditor/ValidationPanel.tsx

## Phase 3.5: Page Components
- [ ] T023 [P] Dashboard page in frontend/src/pages/Dashboard/Dashboard.tsx
- [ ] T024 [P] WorkflowBuilder page in frontend/src/pages/WorkflowBuilder/WorkflowBuilder.tsx
- [ ] T025 [P] WorkflowViewer page in frontend/src/pages/WorkflowViewer/WorkflowViewer.tsx
- [ ] T026 [P] App routing and navigation in frontend/src/App.tsx

## Phase 3.6: Integration
- [ ] T027 Connect workflow service to local storage
- [ ] T028 Implement file import/export functionality
- [ ] T029 Add workflow validation integration
- [ ] T030 Implement state management with React Context
- [ ] T031 Add error handling and user feedback

## Phase 3.7: Polish
- [ ] T032 [P] Performance optimization and React.memo usage
- [ ] T033 [P] Accessibility improvements and ARIA labels
- [ ] T034 [P] Update documentation and README
- [ ] T035 [P] Code cleanup and refactoring
- [ ] T036 [P] Manual testing and bug fixes

## Dependencies
- Setup (T001-T005) before everything
- Types (T006-T010) before services (T011-T015)
- Services (T011-T015) before components (T016-T022)
- Components (T016-T022) before pages (T023-T026)
- Pages (T023-T026) before integration (T027-T031)
- Integration (T027-T031) before polish (T032-T036)

## Parallel Execution Examples

### Phase 3.1 Parallel Tasks
```
# Launch T003-T005 together:
Task: "Install and configure React Flow, Monaco Editor, Ajv dependencies"
Task: "Configure ESLint, Prettier, and TypeScript settings"
Task: "Set up testing framework (Jest + React Testing Library)"
```

### Phase 3.2 Parallel Types
```
# Launch T006-T010 together:
Task: "Workflow types in frontend/src/types/workflow.ts"
Task: "Node types in frontend/src/types/node.ts"
Task: "State types in frontend/src/types/state.ts"
Task: "Tool types in frontend/src/types/tool.ts"
Task: "Validation types in frontend/src/types/validation.ts"
```

### Phase 3.3 Parallel Services
```
# Launch T011-T015 together:
Task: "Workflow service in frontend/src/services/workflowService.ts"
Task: "Validation service in frontend/src/services/validationService.ts"
Task: "Export service in frontend/src/services/exportService.ts"
Task: "JSON schema utilities in frontend/src/utils/jsonSchema.ts"
Task: "Workflow parser utilities in frontend/src/utils/workflowParser.ts"
```

### Phase 3.4 Parallel Components
```
# Launch T016-T022 together:
Task: "WorkflowEditor component in frontend/src/components/WorkflowEditor/WorkflowEditor.tsx"
Task: "NodeEditor component in frontend/src/components/NodeEditor/NodeEditor.tsx"
Task: "StateManager component in frontend/src/components/StateManager/StateManager.tsx"
Task: "ToolConfig component in frontend/src/components/ToolConfig/ToolConfig.tsx"
Task: "WorkflowCanvas component in frontend/src/components/WorkflowEditor/WorkflowCanvas.tsx"
Task: "NodePalette component in frontend/src/components/WorkflowEditor/NodePalette.tsx"
Task: "ValidationPanel component in frontend/src/components/WorkflowEditor/ValidationPanel.tsx"
```

### Phase 3.5 Parallel Pages
```
# Launch T023-T026 together:
Task: "Dashboard page in frontend/src/pages/Dashboard/Dashboard.tsx"
Task: "WorkflowBuilder page in frontend/src/pages/WorkflowBuilder/WorkflowBuilder.tsx"
Task: "WorkflowViewer page in frontend/src/pages/WorkflowViewer/WorkflowViewer.tsx"
Task: "App routing and navigation in frontend/src/App.tsx"
```

### Phase 3.7 Parallel Polish
```
# Launch T032-T036 together:
Task: "Performance optimization and React.memo usage"
Task: "Accessibility improvements and ARIA labels"
Task: "Update documentation and README"
Task: "Code cleanup and refactoring"
Task: "Manual testing and bug fixes"
```

## Notes
- [P] tasks = different files, no dependencies
- Commit after each task
- Avoid: vague tasks, same file conflicts
- Each task should be specific enough for an LLM to complete without additional context
- Focus on direct implementation without test-first approach

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - workflow-api.yaml → service implementation tasks
   - Each endpoint → implementation task in services
   
2. **From Data Model**:
   - Workflow entity → workflow types T006 [P]
   - Node entity → node types T007 [P]
   - StateKey entity → state types T008 [P]
   - Tool entity → tool types T009 [P]
   - ValidationError entity → validation types T010 [P]
   
3. **From User Stories**:
   - Workflow creation → component implementation tasks
   - Import/export → service implementation tasks
   - Node editing → component implementation tasks
   - Validation → service implementation tasks
   
4. **From Quickstart**:
   - User scenarios → component implementation tasks
   - Test scenarios → integration tasks

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All entities have model tasks (T006-T010)
- [x] All services have implementation tasks (T011-T015)
- [x] All components have implementation tasks (T016-T022)
- [x] All pages have implementation tasks (T023-T026)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Dependencies clearly defined
- [x] Direct implementation approach
