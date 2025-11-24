import { create } from 'zustand';
import { workflowData } from './data';

// A basic type definition for a workflow. We can expand this later.
export interface Workflow {
  name: string;
  description: string;
  nodes: any;
  // ... other properties
}

interface AppState {
  workflows: Record<string, Workflow>;
  selectedWorkflowId: string | null;
  selectedNodeId: string | null;
  selectWorkflow: (id: string) => void;
  selectNode: (id: string | null) => void;
  updateNode: (nodeId: string, data: any) => void;
}

export const useStore = create<AppState>((set) => ({
  workflows: workflowData.workflows,
  selectedWorkflowId: null,
  selectedNodeId: null,
  selectWorkflow: (id) => set({ selectedWorkflowId: id, selectedNodeId: null }),
  selectNode: (id) => set({ selectedNodeId: id }),
  updateNode: (nodeId, data) =>
    set((state) => {
      if (!state.selectedWorkflowId) return state;
      const newWorkflows = { ...state.workflows };
      const workflow = newWorkflows[state.selectedWorkflowId];
      const node = workflow.nodes[nodeId];
      workflow.nodes[nodeId] = { ...node, ...data };
      return { workflows: newWorkflows };
    }),
}));
