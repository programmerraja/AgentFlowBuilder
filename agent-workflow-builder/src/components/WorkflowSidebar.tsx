import { Box, Button, Heading, VStack } from '@chakra-ui/react';
import { useStore } from '../store';

export function WorkflowSidebar() {
  const { workflows, selectWorkflow, selectedWorkflowId } = useStore();

  return (
    <Box w="250px" bg="gray.50" p={4} borderRightWidth="1px">
      <Heading size="sm" mb={4}>Workflows</Heading>
      <VStack align="stretch" spacing={2}>
        {Object.entries(workflows).map(([id, workflow]) => (
          <Button
            key={id}
            onClick={() => selectWorkflow(id)}
            colorScheme={selectedWorkflowId === id ? 'blue' : 'gray'}
            justifyContent="flex-start"
          >
            {workflow.name}
          </Button>
        ))}
      </VStack>
    </Box>
  );
}
