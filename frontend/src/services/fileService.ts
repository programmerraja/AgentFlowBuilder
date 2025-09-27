import type {
  Workflow,
  WorkflowValidation,
  ValidationError,
  ValidationWarning,
} from '../types';

// File service interface
export interface FileService {
  // Export operations
  exportWorkflow: (workflow: Workflow, format: 'json' | 'yaml' | 'xml') => Promise<string>;
  exportWorkflows: (workflows: Workflow[], format: 'json' | 'yaml' | 'xml') => Promise<string>;
  downloadWorkflow: (workflow: Workflow, filename?: string) => Promise<void>;
  downloadWorkflows: (workflows: Workflow[], filename?: string) => Promise<void>;

  // Import operations
  importWorkflow: (file: File) => Promise<Workflow>;
  importWorkflows: (file: File) => Promise<Workflow[]>;
  validateWorkflowFile: (file: File) => Promise<WorkflowValidation>;
  validateWorkflowsFile: (file: File) => Promise<WorkflowValidation>;

  // File operations
  readFile: (file: File) => Promise<string>;
  writeFile: (content: string, filename: string, mimeType: string) => Promise<void>;
  getFileExtension: (filename: string) => string;
  getMimeType: (extension: string) => string;
}

// File service implementation
export class FileServiceImpl implements FileService {
  async exportWorkflow(workflow: Workflow, format: 'json' | 'yaml' | 'xml'): Promise<string> {
    switch (format) {
      case 'json':
        return JSON.stringify(workflow, null, 2);
      case 'yaml':
        // In a real implementation, you would use a YAML library
        return JSON.stringify(workflow, null, 2);
      case 'xml':
        // In a real implementation, you would use an XML library
        return JSON.stringify(workflow, null, 2);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  async exportWorkflows(workflows: Workflow[], format: 'json' | 'yaml' | 'xml'): Promise<string> {
    const data = {
      workflows: workflows.reduce((acc, workflow) => {
        acc[workflow.name] = workflow;
        return acc;
      }, {} as Record<string, Workflow>),
    };

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'yaml':
        // In a real implementation, you would use a YAML library
        return JSON.stringify(data, null, 2);
      case 'xml':
        // In a real implementation, you would use an XML library
        return JSON.stringify(data, null, 2);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  async downloadWorkflow(workflow: Workflow, filename?: string): Promise<void> {
    const content = await this.exportWorkflow(workflow, 'json');
    const finalFilename = filename || `${workflow.name}.json`;
    await this.writeFile(content, finalFilename, 'application/json');
  }

  async downloadWorkflows(workflows: Workflow[], filename?: string): Promise<void> {
    const content = await this.exportWorkflows(workflows, 'json');
    const finalFilename = filename || 'workflows.json';
    await this.writeFile(content, finalFilename, 'application/json');
  }

  async importWorkflow(file: File): Promise<Workflow> {
    const content = await this.readFile(file);
    try {
      const data = JSON.parse(content);
      
      // Basic validation
      if (!data.name || !data.description || !data.nodes || !data.states || !data.summary) {
        throw new Error('Invalid workflow format');
      }

      return data as Workflow;
    } catch (error) {
      throw new Error(`Failed to import workflow: ${(error as Error).message}`);
    }
  }

  async importWorkflows(file: File): Promise<Workflow[]> {
    const content = await this.readFile(file);
    try {
      const data = JSON.parse(content);
      
      if (data.workflows) {
        return Object.values(data.workflows) as Workflow[];
      } else if (Array.isArray(data)) {
        return data as Workflow[];
      } else {
        throw new Error('Invalid workflows format');
      }
    } catch (error) {
      throw new Error(`Failed to import workflows: ${(error as Error).message}`);
    }
  }

  async validateWorkflowFile(file: File): Promise<WorkflowValidation> {
    try {
      const workflow = await this.importWorkflow(file);
      
      // Basic validation
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      if (!workflow.name) {
        errors.push({
          field: 'name',
          message: 'Workflow name is required',
          severity: 'error',
        });
      }

      if (!workflow.description) {
        warnings.push({
          field: 'description',
          message: 'Workflow description is recommended',
        });
      }

      if (!workflow.nodes || Object.keys(workflow.nodes).length === 0) {
        errors.push({
          field: 'nodes',
          message: 'Workflow must have at least one node',
          severity: 'error',
        });
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [{
          field: 'file',
          message: `Invalid file: ${(error as Error).message}`,
          severity: 'error',
        }],
        warnings: [],
      };
    }
  }

  async validateWorkflowsFile(file: File): Promise<WorkflowValidation> {
    try {
      const workflows = await this.importWorkflows(file);
      
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      if (workflows.length === 0) {
        errors.push({
          field: 'workflows',
          message: 'No workflows found in file',
          severity: 'error',
        });
      }

      workflows.forEach((workflow, index) => {
        if (!workflow.name) {
          errors.push({
            field: `workflows[${index}].name`,
            message: 'Workflow name is required',
            severity: 'error',
          });
        }
      });

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [{
          field: 'file',
          message: `Invalid file: ${(error as Error).message}`,
          severity: 'error',
        }],
        warnings: [],
      };
    }
  }

  async readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  async writeFile(content: string, filename: string, mimeType: string): Promise<void> {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      'json': 'application/json',
      'yaml': 'application/x-yaml',
      'yml': 'application/x-yaml',
      'xml': 'application/xml',
      'txt': 'text/plain',
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }
}