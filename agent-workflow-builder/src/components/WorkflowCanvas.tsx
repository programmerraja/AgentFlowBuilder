import { Box, Heading } from '@chakra-ui/react';
import ReactFlow, { MiniMap, Controls, Background, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '../store';
import { useEffect, useState } from 'react';

export function WorkflowCanvas() {
  const { selectedWorkflowId, workflows, selectNode } = useStore();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    if (selectedWorkflowId) {
      const workflow = workflows[selectedWorkflowId];
      if (!workflow) {
        setNodes([]);
        setEdges([]);
        return;
      }

      const initialNodes: Node[] = Object.entries(workflow.nodes).map(([id, node], index) => ({
        id: id,
        data: { label: node.label || id },
        position: { x: index * 200, y: 100 + (index % 2) * 100 }, // Basic layout
      }));
      setNodes(initialNodes);

      // Transform edges
      const initialEdges: Edge[] = [];
      Object.entries(workflow.nodes).forEach(([sourceId, node]) => {
        if (node.edges) {
          node.edges.forEach((edge: any) => {
            initialEdges.push({
              id: `${sourceId}-${edge.nextNode}`,
              source: sourceId,
              target: edge.nextNode,
              label: edge.condition,
              animated: true,
            });
          });
        }
      });
      setEdges(initialEdges);

    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [selectedWorkflowId, workflows]);

  if (!selectedWorkflowId) {
    return (
      <Box flex="1" p={10} textAlign="center" bg="gray.100">
        <Heading size="md">Select a workflow to view its canvas.</Heading>
      </Box>
    );
  }

  return (
    <Box flex="1" h="100%">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={(_event, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(null)}
      >
        <Controls />
        <MiniMap />
        <Background gap={16} size={1} />
      </ReactFlow>
    </Box>
  );
}
