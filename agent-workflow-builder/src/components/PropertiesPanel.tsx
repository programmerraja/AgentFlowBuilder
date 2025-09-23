import { Box, Heading, FormControl, FormLabel, Input, Textarea } from '@chakra-ui/react';
import { useStore } from '../store';

export function PropertiesPanel() {
  const {
    workflows,
    selectedWorkflowId,
    selectedNodeId,
    updateNode,
  } = useStore();

  const selectedWorkflow = selectedWorkflowId ? workflows[selectedWorkflowId] : null;
  const selectedNode = selectedWorkflow && selectedNodeId ? selectedWorkflow.nodes[selectedNodeId] : null;

  const handleNodeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (selectedNodeId) {
      updateNode(selectedNodeId, { [e.target.name]: e.target.value });
    }
  };

  if (selectedNode) {
    return (
      <Box w="350px" bg="gray.50" p={4} borderLeftWidth="1px">
        <Heading size="sm" mb={4}>Edit Node: {selectedNode.label || selectedNodeId}</Heading>
        <FormControl>
          <FormLabel>Label</FormLabel>
          <Input name="label" value={selectedNode.label || ''} onChange={handleNodeChange} />
        </FormControl>
        <FormControl mt={4}>
          <FormLabel>Prompt</FormLabel>
          <Textarea name="prompt" value={selectedNode.prompt || ''} onChange={handleNodeChange} />
        </FormControl>
      </Box>
    );
  }

  // TODO: Add workflow editor here

  return (
    <Box w="350px" bg="gray.50" p={4} borderLeftWidth="1px">
      <Heading size="sm" mb={4}>Properties</Heading>
      {selectedWorkflowId ? (
        <p>Select a node to edit its properties.</p>
      ) : (
        <p>Select a workflow to get started.</p>
      )}
    </Box>
  );
}
