import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Create Ajv instance with JSON Schema Draft 7 support
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false,
});

// Add format validators (email, date, etc.)
addFormats(ajv);

// Basic workflow schema for validation
export const workflowSchema = {
  type: 'object',
  properties: {
    workflows: {
      type: 'object',
      patternProperties: {
        '^[a-zA-Z][a-zA-Z0-9_]*$': {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
            nodes: {
              type: 'object',
              patternProperties: {
                '^[a-zA-Z][a-zA-Z0-9_]*$': {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    prompt: { type: 'string' },
                    tools: { type: 'array' },
                    stateKeys: { type: 'array' },
                    edges: { type: 'array' },
                  },
                  required: ['id', 'name', 'prompt'],
                },
              },
            },
            states: {
              type: 'object',
              properties: {
                conversationState: { type: 'object' },
                data: { type: 'object' },
              },
            },
          },
          required: ['name', 'description', 'version', 'nodes', 'states'],
        },
      },
    },
    states: {
      type: 'object',
      properties: {
        conversationState: { type: 'object' },
        data: { type: 'object' },
      },
    },
  },
  required: ['workflows'],
};

// Compile the schema
export const validateWorkflow = ajv.compile(workflowSchema);

// Helper function to validate workflow data
export const validateWorkflowData = (data: unknown) => {
  const valid = validateWorkflow(data);

  if (!valid) {
    return {
      valid: false,
      errors: validateWorkflow.errors || [],
    };
  }

  return {
    valid: true,
    errors: [],
  };
};

// Helper function to format validation errors
export const formatValidationErrors = (errors: unknown[]) => {
  return errors.map((error) => {
    const errorObj = error as Record<string, unknown>;
    return {
      path: errorObj.instancePath || errorObj.schemaPath,
      message: errorObj.message,
      data: errorObj.data,
    };
  });
};

export default ajv;
