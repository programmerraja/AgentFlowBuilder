# Quickstart Guide: Workflow Builder UI

**Feature**: Workflow Builder UI  
**Date**: 2024-12-19  
**Phase**: 1 - Design & Contracts

## Overview

The Workflow Builder UI is a visual tool for creating, editing, and testing AI agent workflows. This guide walks you through the essential features and common workflows.

## Prerequisites

- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Basic understanding of workflow concepts
- JSON workflow definitions (optional, for import)

## Getting Started

### 1. Launch the Application

1. Open your web browser
2. Navigate to the Workflow Builder URL
3. Wait for the application to load (<2 seconds)

### 2. Create Your First Workflow

1. Click "Create New Workflow" on the dashboard
2. Enter workflow details:
   - **Name**: "My First Workflow"
   - **Description**: "A simple workflow for testing"
   - **Version**: "1.0.0"
3. Click "Create" to proceed to the workflow editor

### 3. Add Your First Node

1. In the workflow editor, click "Add Node"
2. Select node type: "Input" (for data collection)
3. Configure the node:
   - **Name**: "collectUserInfo"
   - **Label**: "Collect User Information"
   - **Prompt**: "Please provide your name and email address"
4. Click "Save Node"

### 4. Configure State Keys

1. In the node editor, go to "State Keys" tab
2. Add required state keys:
   - **Name**: "userName"
   - **Type**: "string"
   - **Required**: true
   - **Description**: "User's full name"
3. Add another state key:
   - **Name**: "userEmail"
   - **Type**: "string"
   - **Required**: true
   - **Description**: "User's email address"

### 5. Add Tools

1. Go to "Tools" tab in the node editor
2. Add a tool:
   - **Name**: "validateEmail"
   - **Description**: "Validate email format"
   - **Parameters**:
     - **Name**: "email"
     - **Type**: "string"
     - **Required**: true
3. Click "Save Tool"

### 6. Add Another Node

1. Click "Add Node" again
2. Select node type: "Process" (for data processing)
3. Configure the node:
   - **Name**: "processUserData"
   - **Label**: "Process User Data"
   - **Prompt**: "Thank you! I'll process your information now."

### 7. Connect Nodes

1. In the workflow canvas, hover over the first node
2. Drag from the connection point to the second node
3. Configure the edge:
   - **Condition**: "when userName and userEmail are provided"
   - **Label**: "Data Collected"


### 8. Save and Export

1. Click "Save Workflow" to save locally
2. Click "Export" to download as JSON file
3. Choose format: JSON or YAML

## Common Workflows

### Healthcare Appointment Booking

1. **Create Workflow**: "AppointmentBooking"
2. **Add Nodes**:
   - Patient verification node
   - Provider selection node
   - Appointment scheduling node
   - Confirmation node
3. **Configure State Keys**:
   - Patient ID, provider ID, appointment time
4. **Add Tools**:
   - Patient lookup, provider search, slot availability
5. **Test with Mock Data**:
   - Patient: "Alice Johnson, DOB: 1990-01-01"
   - Provider: "Dr. Smith"
   - Time: "2024-01-15 10:00 AM"

### Travel Booking

1. **Create Workflow**: "FlightBooking"
2. **Add Nodes**:
   - Customer verification
   - Travel details collection
   - Flight search
   - Booking confirmation
3. **Configure Dependencies**:
   - Flight search requires customer verification
4. **Test with Mock Data**:
   - Customer: "john@example.com"
   - Travel: "NYC to LAX, 2024-02-01"
   - Passengers: 2

## Advanced Features

### Import Existing Workflow

1. Click "Import Workflow" on dashboard
2. Select JSON file from your computer
3. Choose validation options:
   - Validate schema: Yes
   - Fix common issues: Yes
4. Click "Import"
5. Review imported workflow in editor

### Workflow Validation

1. In the workflow editor, click "Validate"
2. Review validation results:
   - **Errors**: Must be fixed before saving
   - **Warnings**: Should be addressed
   - **Info**: Suggestions for improvement
3. Fix issues by editing nodes or configuration
4. Re-validate until all errors are resolved

### Custom Tools

1. Go to "Tools" tab in any node
2. Click "Add Custom Tool"
3. Define tool parameters:
   - **Name**: "customAPI"
   - **Description**: "Call external API"
   - **Parameters**: Define input schema
   - **Mock Response**: Provide test data
4. Save and use in workflow


## Troubleshooting

### Common Issues

**Workflow won't save**
- Check for validation errors
- Ensure all required fields are filled
- Verify node connections are valid

**Import fails**
- Validate JSON format
- Check workflow schema compatibility
- Review error messages for specific issues


### Getting Help

1. **Documentation**: Check the help section
2. **Validation Errors**: Read error messages carefully
3. **Console Logs**: Open browser dev tools for debugging
4. **Support**: Contact support team with specific error details

## Best Practices

### Workflow Design

1. **Keep it Simple**: Start with basic workflows
2. **Clear Naming**: Use descriptive names for nodes and state keys
3. **Logical Flow**: Ensure nodes follow logical sequence
4. **Error Handling**: Add error nodes for common failure cases


### Performance

1. **Efficient Nodes**: Avoid unnecessary processing
2. **State Management**: Use only required state keys
3. **Tool Optimization**: Minimize external API calls
4. **Regular Cleanup**: Remove unused nodes and tools

## Next Steps

1. **Explore Templates**: Check out pre-built workflow templates
2. **Advanced Features**: Learn about custom validation and complex workflows
3. **Integration**: Connect with external systems and APIs
4. **Collaboration**: Share workflows with team members

## Support

For additional help:
- **Documentation**: [Link to full documentation]
- **Examples**: [Link to example workflows]
- **Community**: [Link to community forum]
- **Support**: [Contact information]
