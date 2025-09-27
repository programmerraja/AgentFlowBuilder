# Agent Workflow Builder: A Comprehensive Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Problem Statement](#problem-statement)
3. [Solution Overview](#solution-overview)
4. [System Architecture](#system-architecture)
5. [Core Components](#core-components)
6. [Workflow Definitions](#workflow-definitions)
7. [Example Implementation](#example-implementation)
8. [Technical Architecture](#technical-architecture)
9. [Implementation Guide](#implementation-guide)
10. [Best Practices & Troubleshooting](#best-practices--troubleshooting)
11. [Advantages & Benefits](#advantages--benefits)

## Introduction

The Agent Workflow Builder is a sophisticated system designed to solve a critical challenge in AI-powered conversational systems: **making Large Language Models (LLMs) follow strict, step-by-step guidelines consistently and reliably**.

### The Core Challenge
Traditional LLM-based systems struggle with:
- Maintaining consistent conversation flow
- Following complex multi-step processes
- Handling state management across interactions
- Integrating with external systems reliably
- Providing predictable, deterministic outcomes

### Our Solution
We've developed a workflow-driven approach that structures AI conversations around predefined business processes, ensuring consistent, reliable, and traceable interactions that can integrate seamlessly with existing systems like Electronic Health Records (EHR).

## Problem Statement

### Current State: Manual Nurse Workflows
In healthcare settings, nurses manually handle patient calls through a complex, multi-step process:

1. **Call Reception**: Answer incoming patient calls
2. **HIPAA Verification**: Collect and verify patient identifiers (first name, last name, DOB, phone number)
3. **Intent Identification**: Understand what the patient needs (appointment booking, prescription refill, etc.)
4. **Process Execution**: Perform the specific action (e.g., book appointment)
5. **System Integration**: Access EHR systems to find providers, available slots, etc.
6. **Confirmation**: Confirm details and complete the transaction

### Challenges with Manual Processes
- **Inconsistency**: Different nurses may handle calls differently
- **Time-consuming**: Each call requires significant human time
- **Error-prone**: Manual data entry and verification
- **Scalability**: Limited by human availability
- **Training**: Requires extensive training for new staff

## Solution Overview

### AI Voice Agent Approach
Our AI voice agent replicates the nurse's workflow but with enhanced consistency and reliability:

- **Automated HIPAA Verification**: Systematically collects and verifies patient information
- **Intelligent Intent Recognition**: Understands patient needs and routes to appropriate workflows
- **Seamless EHR Integration**: Connects directly with existing healthcare systems
- **Consistent Process Execution**: Follows predefined workflows every time
- **24/7 Availability**: Handles calls around the clock

### Design Philosophy
Instead of traditional UI automation, our system is inspired by how healthcare professionals interact with Electronic Health Record (EHR) systems:

- **Workflow-Centric**: Each business process is defined as a complete workflow
- **Node-Based Steps**: Workflows are broken into discrete, manageable steps
- **State-Driven**: All interactions maintain and update relevant state information
- **Tool Integration**: Seamless integration with external systems through defined tools
- **Action Hooks**: Pre and post-actions for system integration and data processing



## System Architecture

The Agent Workflow Builder is built on a modular, state-driven architecture that separates concerns between conversation management, business logic, and system integration.

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   LLM Agent     │◄──►│  Workflow Engine │◄──►│  External APIs  │
│  (Conversation) │    │  (State Mgmt)    │    │  (EHR, etc.)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│  Tool Interface │    │  State Storage   │
│  (5 Core Tools) │    │  (Conversation + │
└─────────────────┘    │   Data States)   │
                       └──────────────────┘
```

## Core Components

### 1. Workflows
**Definition**: A workflow represents a complete business process that can be executed independently.

**Characteristics**:
- Each workflow = one complete business process (e.g., HIPAA verification, appointment booking)
- Contains multiple interconnected nodes representing workflow steps
- Maintains its own state and conversation context
- Can be triggered by user intent or as a prerequisite for other workflows

**Example Workflows**:
- `patientsearch`: Handles patient verification and identification
- `bookAppointment`: Manages the complete appointment booking process
- `cancelAppointment`: Handles appointment cancellations
- `prescriptionRefill`: Manages prescription refill requests

### 2. Nodes
**Definition**: Nodes are the individual steps within a workflow that define specific actions or interactions.

**Node Structure**:
Each node contains several key components:

#### Prompt
- **Purpose**: The text instruction that guides the LLM on how to interact with the user
- **Usage**: Defines what the agent should say and how to collect information
- **Example**: "Say 'I'd need your details to check in our system. Can you provide your full name and date of birth please?'"

#### Pre-Actions
- **Purpose**: Automatically executed when a node is called by the LLM
- **Inspiration**: Similar to React's `useEffect` hook with empty dependency array
- **Use Cases**: 
  - Fetching data before user interaction
  - Initializing system state
  - Preparing external API calls
- **Example**: `["fetchDepartmentsAndProviders"]` - loads available providers before asking user to select

#### Post-Actions
- **Purpose**: Executed when a node completes or when moving to the next node
- **Inspiration**: Similar to React's `useEffect` cleanup function
- **Use Cases**:
  - Saving data to external systems
  - Triggering API calls with collected information
  - Cleaning up temporary state
- **Example**: `["bookAppointment"]` - saves the appointment after user confirms details

#### Tools
- **Purpose**: Available functions the LLM can call during this node's execution
- **Usage**: LLM uses `executeTool` to call these functions
- **Parameters**: Each tool defines required and optional parameters with types
- **Example**: `lookupPatient(firstName, lastName, dob)` - searches for patient in EHR system

#### State Keys
- **Purpose**: Define what data is required or optional for this node
- **Required vs Optional**: Controls whether the node can proceed without certain data
- **Node Affects**: Triggers re-execution of dependent nodes when state changes
- **Example**: `selectedProvider` with `nodeAffects` pointing to `getAppointmentTypes`

#### Edges
- **Purpose**: Define conditional navigation between nodes
- **Structure**: Array of objects specifying when to jump to different nodes
- **Components**:
  - `nodeName`: Target node to jump to
  - `condition`: When to trigger the jump
  - `stateKeys`: Required state values before jumping
- **Example**: Jump to `newPatient` node if patient not found after 2 attempts

### 3. State Management

#### Conversation State
- **Purpose**: Tracks the current position and progress in the workflow
- **Components**:
  - `currentStep`: Currently active node
  - `previousStep`: Previously completed node
  - `completedSteps`: Array of all completed nodes
- **Usage**: Enables resumption and navigation within workflows

#### Data State
- **Purpose**: Stores workflow-related information and user inputs
- **Scope**: Can be workflow-specific or global
- **Types**:
  - User inputs (names, dates, preferences)
  - System data (providers, appointments, slots)
  - Computed values (selections, confirmations)
- **Persistence**: Maintained throughout the conversation session

#### State Key Value Mapping
- **Purpose**: Maps state keys to their corresponding data arrays
- **Usage**: Enables dynamic data binding and validation
- **Example**: `selectedProvider` maps to `providers` array for validation

### 4. Summary
- **Purpose**: Provides a high-level overview of the workflow structure
- **Components**:
  - Workflow name and description
  - Node relationships and dependencies
  - Flow connections between nodes
- **Usage**: Helps with workflow visualization and debugging


## Workflow Definitions

This section provides detailed examples of how workflows are structured and implemented in the Agent Workflow Builder system. We'll examine two core workflows: `patientsearch` and `bookAppointment`.

### Workflow Structure Overview

Each workflow follows a consistent structure:

```javascript
{
  workflows: {
    [workflowName]: {
      name: "workflowName",
      description: "Human-readable description",
      requiredWorkflow: { /* optional */ },
      nodes: { /* node definitions */ },
      states: { /* state management */ },
      summary: { /* workflow overview */ }
    }
  },
  states: { /* global state */ }
}
```

### 1. Patient Search Workflow (`patientsearch`)

**Purpose**: Handles patient verification and identification before any other operations.

**Key Features**:
- HIPAA-compliant patient verification
- Automatic retry logic for failed lookups
- Graceful handling of new patients
- Integration with EHR systems

#### Workflow Definition

```javascript
patientsearch: {
  name: "patientsearch",
  description: "Handles patient search verification",
  
  // Node Definitions
  nodes: {
    collectIdentifiers: {
      isFirstNode: true,           // Entry point of workflow
      preAction: [],               // No pre-actions needed
      stateKeys: [{ 
        id: "verified", 
        required: true 
      }],
      postAction: [],              // No post-actions needed
      
      // Available tools for this node
      tools: [
        {
          name: "lookupPatient",
          description: "Use this to lookup the patient info",
          parameters: [
            { id: "firstName", type: "string", required: true },
            { id: "lastName", type: "string", required: true },
            { 
              id: "dob", 
              type: "string (autoconvert to yyyy-mm-dd format)", 
              required: true 
            }
          ]
        }
      ],
      
      // LLM instruction for this node
      prompt: "Say 'I'd need your details to check in our system. Can you provide your full name and date of birth please?' Collect the user's full name (first and last) and date of birth, skipping any information they've already provided. Do not add extra phrases or say 'verifying or verify' anywhere. If any detail is missing or entered incorrectly, ask again until it is valid. Do not proceed until all required information is collected. Once confirmed, trigger the lookupPatient tool and tell the user: 'Please wait while I pull up your information.'",
      
      // Conditional navigation
      edges: [
        {
          nodeName: "newPatient",
          condition: "if the patient not found in our system after 2 attempts",
          stateKeys: []
        }
      ]
    },
    
    newPatient: {
      prompt: "Inform the user you will be treated as new patient and continue the flow"
    },
    
    end: {
      prompt: "If the caller has already stated their intent, carry it forward after completing patientsearch. Do not ask them again what they need unless it was not specified. Directly trigger the scenario using chooseScenario tool that matches their original intent without seeking confirmation"
    }
  },
  
  // Workflow-specific state
  states: {
    conversationState: {
      currentStep: "collectIdentifiers",
      previousStep: "",
      completedSteps: []
    },
    data: {
      verified: false
    }
  },
  
  // Workflow summary for debugging/visualization
  summary: {
    name: "patientsearch",
    workflows: {
      collectIdentifiers: {
        action: "collectIdentifiers"
      }
    }
  }
}
```

### 2. Book Appointment Workflow (`bookAppointment`)

**Purpose**: Handles the complete appointment booking process after patient verification.

**Key Features**:
- Requires patient verification as prerequisite
- Dynamic provider and appointment type selection
- Real-time slot availability checking
- State-dependent node re-execution
- Integration with booking systems

#### Workflow Definition

```javascript
bookAppointment: {
  name: "bookAppointment",
  description: "Handles patient appointment booking and setup appointment",
  
  // Prerequisite workflow requirement
  requiredWorkflow: {
    must: ["patientsearch"],
    desc: "patientsearch is required before booking an appointment. Please trigger patientsearch scenario if it is already completed make sure you have called end node patientsearch"
  },
  
  nodes: {
    getProviders: {
      isFirstNode: true,
      label: "Fetch Departments & Providers",
      preAction: ["fetchDepartmentsAndProviders"],  // Load providers before interaction
      
      // State management with node affects
      stateKeys: [
        {
          id: "selectedProvider",
          required: true,
          nodeAffects: {
            name: "getAppointmentTypes",
            description: "The provider has been changed. Because of this update, we've triggered the getAppointmentTypes step to refresh the available appointment types for the newly selected provider and department. Ask the user to select an appointment type again from the updated list, update the state accordingly, and then proceed to the next step"
          }
        }
      ],
      
      prompt: "Thank you, I was able to pull up your information. Could you please share the name of the provider with whom you'd like to schedule an appointment? Wait for the user's response before showing any options and ensure that you have a first and a last name for the provider. If given partially, ask for the remaining details. If the user provides a name, confirm it against the available list. If provider isn't available, inform the user and ask if they would like to choose from the available options. List out the available providers if the user has not provided a specific name and let the user select a provider. Once the user selects a provider, proceed to next Node."
    },
    
    getAppointmentTypes: {
      label: "Fetch Appointment Type",
      preAction: ["getAppointmentTypes"],  // Load appointment types for selected provider
      
      stateKeys: [
        {
          id: "selectedAppointmentType",
          required: true,
          description: "Ensure that the user has an appointment type selected. If one is already provided, update the state and proceed without prompting the user again. If none is provided, ask the user for it. (Do not expose this logic to the user if they have already given the appointment type.)",
          nodeAffects: {
            name: "getSlotsAndBook",
            description: "The appointment type has been changed. Because of this update, the getSlotsAndBook step has been triggered to refresh the available slots for the newly selected appointment type. If it is not different from the previous one, no action needs to be taken by the user. The user should be asked to select a slot from the updated list, the state should be updated accordingly, and then the next step should be proceeded with."
          }
        }
      ],
      
      prompt: "Thank the user, then ask them to choose the type of appointment they would like to book. Present the available options and ask which one works best for them. Once the user confirms, proceed directly to the next node. Do not say phrases like 'Let me check on available slots for you'—just move to the next node."
    },
    
    getSlotsAndBook: {
      preAction: ["getSlots"],  // Load available slots
      
      stateKeys: [
        {
          id: "selectedSlot",
          required: true,
          description: ""
        }
      ],
      
      // Tool for filtering slots by date
      tools: [
        {
          name: "getAvailableSlots",
          description: "to get filtered slots",
          parameters: [
            {
              id: "date",
              type: "string (auto-convert user input to MM/DD/YYYY)",
              required: true
            }
          ]
        }
      ],
      
      postAction: ["bookAppointment"],  // Save appointment after confirmation
      
      prompt: `
        Step 1: Ask for Preferred Date
            Ask the user if they have a preferred date for their appointment.

        Step 2: Handle User's Date Response
            When the user provides a date, immediately call the getAvailableSlots tool using executeTool for that date.
            Say: "Okay, let me check if we have availability on [date]."
            Do not wait for another user response before calling the tool.
            Only mention the "our team will call" fallback if 3 attempts fail.
      `
    }
  },
  
  // Comprehensive state management
  states: {
    conversationState: {
      currentStep: "getProviders",
      previousStep: "",
      completedSteps: []
    },
    data: {
      providers: [],
      appointmentTypes: [],
      selectedProvider: {},
      selectedAppointmentType: {},
      selectedSlot: {},
      availableSlots: []
    },
    // State key mapping for validation
    stateKeyValueMap: {
      selectedProvider: "providers",
      selectedAppointmentType: "appointmentTypes",
      selectedSlot: "availableSlots"
    }
  },
  
  // Workflow summary with dependencies
  summary: {
    name: "BookAppointment",
    workflows: {
      getProviders: {
        action: "getProviders",
        dependsOn: [],
        next: ["getAppointmentTypes"]
      },
      getAppointmentTypes: {
        action: "getAppointmentTypes",
        dependsOn: ["getProviders"],
        next: ["getSlotsAndBook"]
      },
      getSlotsAndBook: {
        action: "getSlotsAndBook",
        dependsOn: ["getAppointmentTypes"]
      }
    }
  }
}
```

### Global State Management

```javascript
states: {
  conversationState: {
    currentWorkflow: "",
    previousWorkflow: "",
    completedWorkflows: []
  },
  data: {
    patientInfo: {},
    appointments: []
  }
}
```

### Workflow Scalability

> **Note**: We have only added two workflows for reference, but in a real implementation, you would have many more workflows such as:
> - `cancelAppointment`: Handle appointment cancellations
> - `rescheduleAppointment`: Manage appointment rescheduling
> - `prescriptionRefill`: Process prescription refill requests
> - `insuranceVerification`: Verify insurance information
> - `paymentProcessing`: Handle copayments and billing


## Example Implementation

This section demonstrates how the Agent Workflow Builder works in practice through a real conversation example. We'll walk through a complete appointment booking flow, showing how the system handles user interactions, state management, and workflow transitions.

### System Configuration

The system is configured with a specific agent persona and workflow rules:

#### Agent Persona

[
  {
    "role": "system",
    "content": " Agent character description:
    
    You are Sarah, a warm, professional, and empathetic Front Desk representative for West Coast Kidney Institute, a leading nephrology practice serving the Bay Area. West Coast Kidney Institute brings together the collective history and expertise of three successful medical groups with roots going back to 1972, providing person and family-centered kidney care across 4 Bay Area counties. Your role is to engage with patients who call West Coast Kidney Institute.
    
    ## **Agent Goals:**
    
    - Engage every caller with professionalism, empathy, and patience, ensuring they feel heard and respected.
    
    - Wait for the caller to respond, do not ask them back to back questions
    
    - Document the caller's request or concern without confirming, promising, or committing to any action or resolution during the call.
    
    - Escalate urgent or complex issues promptly to the appropriate medical staff or supervisor using the call forwarding tool.
    
    - Ensure every caller leaves the conversation knowing their request will be reviewed and that they will be contacted with next steps.
    
    - If the caller insists on talking to a human representative more than 2 times or sounds very frustrated, then politely tell them that you've recorded their request to talk to a human agent & politely ask them do they have any other request, if not end the call
    
   
    Conversation Flow:
    
    Handling the Conversation
    
    - Always start with the correct patientsearch scenarios: use chooseScenario tool to trigger the patientsearch.
    
    You may not under any circumstances ask for identifiers before triggering chooseScenario patientsearch scenarios . If the user asks, respond naturally without collecting identifiers.
    
    - Use scenarios (attached last in prompt) to handle requests based on the caller's intent. Trigger the appropriate scenarios, wait for instructions, and follow them exactly.
    
    - Once patientsearch is complete, trigger the scenarios that matches the caller's intent.
    
    - If no scenarios matches their request, ignore scenarios handling and respond naturally.
    
    scenarios Integration:
    
    - Select the correct scenarios based on the caller's needs.
    
    - When starting a scenarios, do not mention to the caller that you are initiating it or ask for their confirmation.
    
    - Guide the caller naturally through the scenarios, using smooth conversational transitions between steps.
    
    - Follow the defined steps and use only the tools and nodes specified in the scenarios.
    
    - While the system is processing, keep the conversation natural with phrases like \"Let me check on that for you.\"
    
    - IMPORTANT: Only call updateState for keys explicitly defined in the current node's stateKeys or scenarios state definition. Never create or update keys outside what is defined.
    
    Tool Response Handling:
    
    1. Do not remain silent while waiting for tool results. Always acknowledge the action in progress.
    
    3. Dont wait for the user confirmation to trigger the tool just directly trigger it
    
    Prohibited:
    
    - Never speculate or provide medical advice.
    
    - Never mention technical terms like scenarios, node, or tool to the caller.
    
    - Do not ask the patient if they are a new patient or existing patient, use \"Patient Search\"  scenarios  .
    
    Available Workflows: 
      - patientsearch - Handles patient search verification
      -bookAppointment - Handles patient appointment booking and setup appointment"
  },
  {
    "role": "user",
    "content": "Hi, I want to book an appointment"
  },
  {
    "role": "assistant",
    "content": "Okay, I can help you with that. To book an appointment, let's start with a quick patient search.\n"
  },
  {
    "role": "user",
    "content": "Okay, sounds good.\n"
  },
  {
    "role": "assistant",
    "tool_calls": [
      {
        "id": "portkey-9ff80e19-500c-429f-ab38-a3de74837545",
        "type": "function",
        "function": {
          "name": "chooseScenario",
          "arguments": "{\"scenarioName\":\"bookAppointment\"}"
        }
      }
    ]
  },
  {
    "role": "tool",
    "tool_call_id": "portkey-9ff80e19-500c-429f-ab38-a3de74837545",
    "content": "patientsearch is required before booking an appointment plse trigger patientsearch scenario if it is already completed make sure you have called end node patientsearch"
  },
  {
    "role": "assistant",
    "content": "Before we proceed, could you please provide me with your first name, last name, and date of birth?\n"
  },
  {
    "role": "user",
    "content": "Yes, uh, it's Alice Johnson. September 22nd, 2004.\n"
  },
  {
    "role": "assistant",
    "tool_calls": [
      {
        "id": "portkey-ba6ddaad-d03f-433e-a206-4dd0e039e812",
        "type": "function",
        "function": {
          "name": "updateState",
          "arguments": "{\"key\":\"firstName\",\"value\":\"Alice\"}"
        }
      }
    ]
  },
  {
    "role": "tool",
    "tool_call_id": "portkey-ba6ddaad-d03f-433e-a206-4dd0e039e812",
    "content": "ok"
  },
  {
    "role": "assistant",
    "tool_calls": [
      {
        "id": "portkey-819f0f2a-443e-4cdb-8707-b57372c9d6ee",
        "type": "function",
        "function": {
          "name": "updateState",
          "arguments": "{\"key\":\"lastName\",\"value\":\"Johnson\"}"
        }
      }
    ]
  },
  {
    "role": "tool",
    "tool_call_id": "portkey-819f0f2a-443e-4cdb-8707-b57372c9d6ee",
    "content": "ok"
  },
  {
    "role": "assistant",
    "tool_calls": [
      {
        "id": "portkey-a0758e9c-17d4-428c-a6b7-192ae75c4513",
        "type": "function",
        "function": {
          "name": "updateState",
          "arguments": "{\"value\":\"2004-09-22\",\"key\":\"dateOfBirth\"}"
        }
      }
    ]
  },
  {
    "role": "tool",
    "tool_call_id": "portkey-a0758e9c-17d4-428c-a6b7-192ae75c4513",
    "content": "ok"
  },
  {
    "role": "assistant",
    "tool_calls": [
      {
        "id": "portkey-85ef95a9-2e86-4ee9-9624-8a4e794a7e2b",
        "type": "function",
        "function": {
          "name": "chooseScenario",
          "arguments": "{\"scenarioName\":\"patientsearch\"}"
        }
      }
    ]
  },
  {
    "role": "tool",
    "tool_call_id": "portkey-85ef95a9-2e86-4ee9-9624-8a4e794a7e2b",
    "content": "Scenario: patientsearch\nTotal Nodes: 1\nNode 1: collectIdentifiers\nNode 2: end\nCurrent Node: collectIdentifiers\nNext Node: end\nExpected State updates: verified\nNote: When updating the state, use the corresponding ID if available, but do not reveal the ID to the user.\nTools:\n- lookupPatient(firstName: string, lastName: string, dob: string (autoconvert to yyyy-mm-dd format))\nInstructions: Say 'I'd need your details to check in our system. Can you provide your full name and date of birth please?' Collect the user's full name (first and last) and date of birth, skipping any information they've already provided. Do not add extra phrases or say 'verifying or verify' anywhere. If any detail is missing or entered incorrectly, ask again until it is valid. Do not proceed until all required information is collected. Once confirmed, trigger the lookupPatient tool and tell the user: 'Please wait while I pull up your information.' \n"
  },
  {
    "role": "assistant",
    "tool_calls": [
      {
        "id": "portkey-a55ca4a3-598e-4862-b155-009ae07b6fcd",
        "type": "function",
        "function": {
          "name": "executeTool",
          "arguments": "{\"params\":\"{\\\"firstName\\\": \\\"Alice\\\", \\\"lastName\\\": \\\"Johnson\\\", \\\"dob\\\": \\\"2004-09-22\\\"}\",\"toolName\":\"lookupPatient\"}"
        }
      }
    ],
    "content": "Please wait while I pull up your information.\n"
  },
  {
    "role": "tool",
    "tool_call_id": "portkey-a55ca4a3-598e-4862-b155-009ae07b6fcd",
    "content": "we have idetified here the paitent details id: ICA040963 Alice Johnson, DOB: 2004-09-22,  \n. Move on to the next node"
  },
  {
    "role": "assistant",
    "content": "Please wait while I pull up your information.\n"
  },
  {
    "role": "user",
    "content": "Okay, I'll wait.\n"
  },
  {
    "role": "assistant",
    "tool_calls": [
      {
        "id": "portkey-661d7177-0e54-4eb6-b7ab-37b42065a0e2",
        "type": "function",
        "function": {
          "name": "updateState",
          "arguments": "{\"value\":\"true\",\"key\":\"patientFound\"}"
        }
      }
    ]
  },
  {
    "role": "tool",
    "tool_call_id": "portkey-661d7177-0e54-4eb6-b7ab-37b42065a0e2",
    "content": "ok"
  },
  {
    "role": "assistant",
    "tool_calls": [
      {
        "id": "portkey-121e488f-9089-4a56-91ff-cc0619a56c00",
        "type": "function",
        "function": {
          "name": "updateState",
          "arguments": "{\"value\":\"ICA040963\",\"key\":\"patientId\"}"
        }
      }
    ]
  },
  {
    "role": "tool",
    "tool_call_id": "portkey-121e488f-9089-4a56-91ff-cc0619a56c00",
    "content": "ok"
  },
  {
    "role": "assistant",
    "tool_calls": [
      {
        "id": "portkey-a67ca7c6-92f8-4159-8dff-a1da8a27a672",
        "type": "function",
        "function": {
          "name": "nextNode",
          "arguments": "{\"nodeName\":\"end\"}"
        }
      }
    ]
  },
  {
    "role": "tool",
    "tool_call_id": "portkey-a67ca7c6-92f8-4159-8dff-a1da8a27a672",
    "content": "If the caller has already stated their intent, carry it forward after completing patientsearch. Do not ask them again what they need unless it was not specified. Directly trigger the scenario using chooseScenario tool that matches their original intent without seeking confirmation"
  },
  {
    "role": "assistant",
    "content": "Since you're looking to book an appointment, do you have a preferred location in the Bay Area where you'd like to be seen?\n"
  },
  {
    "role": "user",
    "content": "I'd like to be seen in Palo Alto.\n"
  },
  {
    "role": "assistant",
    "content": "Okay, let me just confirm, you're looking to book an appointment in Palo Alto. Is that correct?\n"
  },
  {
    "role": "user",
    "content": "Yes, that's correct.\n"
  },
  {
    "role": "assistant",
    "tool_calls": [
      {
        "id": "portkey-1f339124-82e3-44d7-ae38-fb37e6d6358b",
        "type": "function",
        "function": {
          "name": "updateState",
          "arguments": "{\"value\":\"Palo Alto\",\"key\":\"locationPreference\"}"
        }
      }
    ]
  },
  {
    "role": "tool",
    "tool_call_id": "portkey-1f339124-82e3-44d7-ae38-fb37e6d6358b",
    "content": "ok"
  },
  {
    "role": "assistant",
    "content": "Could you tell me the reason for your visit today?\n"
  },
  {
    "role": "user",
    "content": "I need a consultation appointment.\n"
  },
  {
    "role": "assistant",
    "tool_calls": [
      {
        "id": "portkey-b8301809-d938-4902-a5f3-a6dc07ef3003",
        "type": "function",
        "function": {
          "name": "updateState",
          "arguments": "{\"key\":\"reasonForVisit\",\"value\":\"consultation\"}"
        }
      }
    ]
  },
  {
    "role": "tool",
    "tool_call_id": "portkey-b8301809-d938-4902-a5f3-a6dc07ef3003",
    "content": "ok"
  },
  {
    "role": "assistant",
    "content": "I've recorded your request for a consultation appointment in Palo Alto. The team will review your request and contact you as soon as they possibly can. Every request from our patients is important to us. Is there anything else I can help you with today?\n"
  },
  {
    "role": "user",
    "content": "How long will that take?\n"
  },
  {
    "role": "assistant",
    "content": "The team will callback as soon as they possibly can because every request from their patients is important to them.\n"
  }
]

TOOLS Attached to LLM
[
  {
    type: "function",
    function: {
      name: "getState",
      description:
        "If you want any data from workflow, pass the state key and get the value of it.",
      parameters: {
        type: "object",
        properties: {
          key: {
            type: "string",
            description: "A key representing the state you need",
          },
        },
        required: ["key"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "chooseScenario",
      description:
        "To get the corresponding workflow based on user requirement, for example if user came for book appointment.",
      parameters: {
        type: "object",
        properties: {
            scenarioName: {
            type: "string",
            description: "A workflow name given in prompt",
          },
        },
        required: ["scenarioName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "updateState",
      description:
        "Call when we need to update the state of the current workflow with key and value.",
      parameters: {
        type: "object",
        properties: {
          key: {
            type: "string",
            description: "Key to update the state object",
          },
          value: {
            type: "string",
            description:
              "Value to update the state (if it is JSON, provide in string format)",
          },
        },
        required: ["key", "value"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "executeTool",
      description: "Use this when you want to execute any tool to get data.",
      parameters: {
        type: "object",
        properties: {
          params: {
            type: "string",
            description:
              'If there is only one parameter, pass it as a plain string, e.g., "param1". If there are multiple parameters, pass them as a JSON object in string format, e.g., "{\\"key1\\": \\"value1\\", \\"key2\\": \\"value2\\"}".',
          },
          toolName: {
            type: "string",
            description: "The tool name that you want to execute and get data.",
          },
        },
        required: ["params", "toolName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "nextNode",
      description:
        "Need to call when the current state (flow) is completed and you want to get the next node.",
      parameters: {
        type: "object",
        properties: {
          nodeName: {
            type: "string",
            description: "Next node name",
          },
        },
        required: ["nodeName"],
      },
    },
  },
];

### Key Observations from This Example

1. **Workflow Dependencies**: The system automatically enforces that `patientsearch` must complete before `bookAppointment` can begin.

2. **State Management**: Each piece of information is systematically stored using `updateState` calls.

3. **External Integration**: The system seamlessly calls external EHR systems using the `executeTool` function.

4. **Natural Conversation Flow**: Despite the complex underlying workflow, the conversation feels natural and human-like.

5. **Error Handling**: The system gracefully handles workflow transitions and maintains context throughout the conversation.

6. **Tool Usage**: Only the 5 core tools are used, keeping the system simple and predictable.

## Technical Architecture

### Core System Components

#### 1. Workflow Engine
- **Purpose**: Manages workflow execution, state transitions, and node navigation
- **Responsibilities**:
  - Validating workflow prerequisites
  - Executing pre and post actions
  - Managing state updates
  - Handling node transitions and edges

#### 2. State Manager
- **Purpose**: Handles all state management operations
- **Components**:
  - Conversation state tracking
  - Data state persistence
  - State validation and type checking
  - State key mapping and validation

#### 3. Tool Interface
- **Purpose**: Provides standardized interface for external system integration
- **Core Tools**:
  - `getState`: Retrieve stored state values
  - `chooseScenario`: Trigger workflow selection
  - `updateState`: Store and update state values
  - `executeTool`: Call external system functions
  - `nextNode`: Navigate between workflow nodes

#### 4. LLM Integration Layer
- **Purpose**: Manages communication between the LLM and workflow system
- **Features**:
  - Tool call processing
  - Response formatting
  - Error handling and recovery
  - Context management

### Data Flow Architecture

```
User Input → LLM Processing → Tool Calls → Workflow Engine → State Manager → External Systems
     ↑                                                                              ↓
     ← Response Generation ← State Updates ← Tool Responses ← API Responses ←
```

## Implementation Guide

### Prerequisites

1. **LLM Provider**: Access to a Large Language Model (OpenAI, Anthropic, etc.)
2. **External Systems**: APIs for EHR, appointment booking, etc.
3. **State Storage**: Database or in-memory storage for state persistence
4. **Workflow Definitions**: JSON configuration files defining workflows

### Step-by-Step Implementation

#### 1. Define Workflow Structure
```javascript
// Create workflow definition file
const workflows = {
  patientsearch: {
    name: "patientsearch",
    description: "Handles patient search verification",
    nodes: {
      // Node definitions
    },
    states: {
      // State definitions
    }
  }
};
```

#### 2. Implement Core Tools
```javascript
// Tool implementations
const tools = {
  getState: (key) => stateManager.get(key),
  updateState: (key, value) => stateManager.set(key, value),
  chooseScenario: (scenarioName) => workflowEngine.trigger(scenarioName),
  executeTool: (toolName, params) => externalSystem.call(toolName, params),
  nextNode: (nodeName) => workflowEngine.navigate(nodeName)
};
```

#### 3. Set Up State Management
```javascript
// State manager implementation
class StateManager {
  constructor() {
    this.conversationState = {};
    this.dataState = {};
  }
  
  get(key) {
    return this.dataState[key];
  }
  
  set(key, value) {
    this.dataState[key] = value;
  }
}
```

#### 4. Configure LLM Integration
```javascript
// LLM configuration
const llmConfig = {
  model: "gpt-4",
  tools: Object.keys(tools),
  systemPrompt: agentPersona,
  temperature: 0.7
};
```

### Best Practices

1. **Workflow Design**:
   - Keep workflows focused on single business processes
   - Use clear, descriptive node names
   - Implement proper error handling and fallbacks

2. **State Management**:
   - Use consistent naming conventions for state keys
   - Validate state updates before applying
   - Implement state persistence for long conversations

3. **Tool Integration**:
   - Implement proper error handling for external API calls
   - Use timeouts and retry logic
   - Log all tool calls for debugging

4. **Testing**:
   - Create unit tests for individual workflows
   - Implement integration tests for complete flows
   - Use mock external systems for testing

## Best Practices & Troubleshooting

### Common Issues and Solutions

#### 1. Workflow Not Triggering
**Problem**: LLM doesn't trigger the correct workflow
**Solution**: 
- Check workflow prerequisites
- Verify agent persona configuration
- Ensure clear intent recognition prompts

#### 2. State Not Updating
**Problem**: State values not being stored correctly
**Solution**:
- Verify state key definitions in workflow
- Check tool call parameters
- Ensure state manager is properly initialized

#### 3. External API Failures
**Problem**: External system calls failing
**Solution**:
- Implement proper error handling
- Add retry logic with exponential backoff
- Use circuit breaker pattern for unreliable services

#### 4. Conversation Flow Issues
**Problem**: Agent getting stuck or repeating steps
**Solution**:
- Review node edge conditions
- Check state requirements
- Implement conversation timeout handling

### Performance Optimization

1. **State Caching**: Cache frequently accessed state values
2. **Tool Call Batching**: Batch multiple tool calls when possible
3. **Workflow Caching**: Cache workflow definitions and node configurations
4. **Response Streaming**: Stream responses for better user experience

### Security Considerations

1. **Data Privacy**: Ensure HIPAA compliance for healthcare data
2. **Input Validation**: Validate all user inputs and external API responses
3. **Access Control**: Implement proper authentication and authorization
4. **Audit Logging**: Log all state changes and tool calls for compliance

## Advantages & Benefits

### Minimal Tooling (Only 5 Core Tools)

Unlike approaches that overwhelm the LLM with dozens of tools, our design limits it to just 5 universal tools:

- **`executeTool`** → fetch external data
- **`updateState`** → store key–value data into workflow state
- **`chooseWorkflow`** → route user to the right workflow (e.g., booking, cancellation)
- **`getState`** → retrieve previously stored data deterministically
- **`nextNode`** → move to the next step in the workflow

→ This keeps the LLM's role focused and predictable, reducing hallucinations and unnecessary tool calls.

### Deterministic State Management

Most of the workflow logic and data handling happens outside of the LLM in structured state.
This ensures the flow is traceable, testable, and replayable, unlike prompt-only approaches where reasoning is opaque.

### Separation of Concerns

- **LLM handles**: Language understanding + decision routing
- **System/state handles**: Data persistence + workflow execution

This makes debugging easier and allows workflows to be updated without retraining or reprompting the LLM.

### Scalable Workflow Design

Adding a new workflow (e.g., "Cancel Appointment") only requires defining its nodes + states, not rewriting prompt logic.
Since all workflows share the same 5 tools, scaling is linear and maintainable.

### Key Benefits Summary

1. **Consistency**: Every conversation follows the same structured approach
2. **Reliability**: Deterministic state management reduces errors
3. **Maintainability**: Easy to update workflows without retraining
4. **Scalability**: Simple to add new workflows and capabilities
5. **Debugging**: Clear separation makes troubleshooting straightforward
6. **Integration**: Seamless connection with existing systems
7. **Compliance**: Structured approach supports regulatory requirements
