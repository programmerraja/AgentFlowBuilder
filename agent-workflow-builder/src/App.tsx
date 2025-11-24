import { Box, Flex, Heading, Button } from '@chakra-ui/react';
import { WorkflowSidebar } from './components/WorkflowSidebar';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { useStore } from './store';

function App() {
  const { workflows } = useStore();

  const handleExport = () => {
    const dataToExport = {
      workflows,
      // You can add other parts of the state here if needed
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataToExport, null, 2)
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = 'agent-workflows.json';
    link.click();
  };

  return (
    <Flex h="100vh" direction="column">
      <Flex borderBottomWidth="1px" p={4} justify="space-between" align="center">
        <Heading size="md">Agent Workflow Builder</Heading>
        <Button onClick={handleExport} colorScheme="teal">Export JSON</Button>
      </Flex>
      <Flex flex="1" overflow="hidden">
        <WorkflowSidebar />
        <WorkflowCanvas />
        <PropertiesPanel />
      </Flex>
    </Flex>
  );
}

export default App;
