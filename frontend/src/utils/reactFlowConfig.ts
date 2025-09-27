import { Node, Edge } from '@xyflow/react';

// Define custom node types for workflow nodes (will be implemented later)
export const nodeTypes = {};

// Define custom edge types (will be implemented later)
export const edgeTypes = {};

// Default node styles
export const defaultNodeStyle = {
  background: '#1a1a1a',
  color: '#fff',
  border: '1px solid #333',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: '500',
};

// Default edge styles
export const defaultEdgeStyle = {
  stroke: '#666',
  strokeWidth: 2,
  strokeDasharray: '0',
};

// React Flow configuration
export const reactFlowConfig = {
  nodeTypes,
  edgeTypes,
  defaultViewport: { x: 0, y: 0, zoom: 1 },
  minZoom: 0.1,
  maxZoom: 4,
  snapToGrid: true,
  snapGrid: [15, 15],
  fitView: true,
  attributionPosition: 'bottom-left',
};

// Helper function to create a new node
export const createNode = (
  id: string,
  type: string,
  position: { x: number; y: number },
  data: Record<string, unknown> = {}
): Node => ({
  id,
  type,
  position,
  data: {
    label: (data.label as string) || id,
    ...data,
  },
  style: {
    ...defaultNodeStyle,
    ...(data.style as Record<string, unknown>),
  },
});

// Helper function to create a new edge
export const createEdge = (
  id: string,
  source: string,
  target: string,
  data: Record<string, unknown> = {}
): Edge => ({
  id,
  source,
  target,
  type: (data.type as string) || 'default',
  data,
  style: {
    ...defaultEdgeStyle,
    ...(data.style as Record<string, unknown>),
  },
  animated: (data.animated as boolean) || false,
});
