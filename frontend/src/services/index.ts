// Export service interfaces and implementations
export type {
  WorkflowService,
} from './workflowService';

export type {
  StateService,
} from './stateService';

export type {
  ToolService,
} from './toolService';

export type {
  ValidationService,
} from './validationService';

export type {
  FileService,
} from './fileService';

// Export service implementations
export {
  WorkflowServiceImpl,
} from './workflowService';

export {
  StateServiceImpl,
} from './stateService';

export {
  ToolServiceImpl,
} from './toolService';

export {
  ValidationServiceImpl,
} from './validationService';

export {
  FileServiceImpl,
} from './fileService';

// Create and export service instances
import { WorkflowServiceImpl } from './workflowService';
import { StateServiceImpl } from './stateService';
import { ToolServiceImpl } from './toolService';
import { ValidationServiceImpl } from './validationService';
import { FileServiceImpl } from './fileService';

export const workflowService = new WorkflowServiceImpl();
export const stateService = new StateServiceImpl();
export const toolService = new ToolServiceImpl();
export const validationService = new ValidationServiceImpl();
export const fileService = new FileServiceImpl();