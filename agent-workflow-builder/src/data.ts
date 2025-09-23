export const workflowData = {
  "workflows": {
    "hipaaVerification": {
      "name": "HIPAA Verification Workflow",
      "description": "Verifies patient identity before accessing PHI or booking.",
      "nodes": {
        "collectIdentifiers": {
          "isFirstNode": true,
          "label": "Collect Identifiers",
          "pre_actions": [],
          "stateKeys": [
            { "id": "providerDOB", "required": true, "nodeAffects": [] },
            { "id": "firstName", "required": true, "nodeAffects": [] },
            { "id": "lastName", "required": true, "nodeAffects": [] }
          ],
          "post_actions": [],
          "tools": [
            {
              "name": "lookupPatient",
              "description": "Lookup patient information",
              "parameters": [
                { "id": "firstName", "type": "string" },
                { "id": "lastName", "type": "string" },
                { "id": "dob", "type": "string (yyyy-mm-dd)" },
                { "id": "phone", "type": "string", "optional": true }
              ]
            }
          ],
          "edges": [
            { "condition": "patient is found", "nextNode": "handleVerificationResult" },
            { "condition": "patient is not found", "nextNode": "end" }
          ],
          "prompt": "Collect patient identifiers (first name, last name, DOB). Use lookupPatient to verify. If multiple matches, request phone number. Update state and proceed accordingly. End call if verification fails."
        },
        "handleVerificationResult": { "label": "Handle Verification", "prompt": "Patient verified successfully." },
        "end": { "label": "End", "prompt": "HIPAA verification completed." }
      },
      "state": {
        "conversation_state": { "current_step": "collectIdentifiers", "previous_step": "", "completed_steps": [] },
        "data": { "patientInfo": { "dob": "", "firstName": "", "lastName": "", "patientId": "" }, "providedDOB": "", "providedPhone": "", "providedFirstName": "", "providedLastName": "", "verificationStatus": "" }
      },
      "summary": {
        "name": "HIPAAVerification",
        "workflows": {
          "collectIdentifiers": { "action": "collectIdentifiers", "next": ["validateIdentifiers"] },
          "validateIdentifiers": { "action": "validateIdentifiers", "depends_on": ["collectIdentifiers"], "next": ["handleVerificationResult"] },
          "handleVerificationResult": { "action": "handleVerificationResult", "depends_on": ["validateIdentifiers"], "next": ["end"] }
        },
        "state": { "data": { "patientInfo": "", "providedDOB": "", "providedPhone": "", "verificationStatus": "" } }
      }
    },
    "bookAppointment": {
      "name": "Book Appointment Workflow",
      "description": "Handles booking appointments with providers, departments, slots, and types.",
      "requiredWorkflow": { "must": ["hipaaVerification"], "mustDesc": "HIPAA verification is required before booking" },
      "nodes": {
        "getDepartmentsAndProviders": {
          "isFirstNode": true,
          "label": "Get Depts & Providers",
          "preAction": "fetchDepartmentsAndProviders",
          "postAction": "",
          "prompt": "Present departments to the patient. Ask to choose department and provider, then update state."
        },
        "getAppointmentTypes": {
          "label": "Get Appt. Types",
          "preAction": "getAppointmentTypes",
          "prompt": "Present appointment types and update state with selection."
        },
        "getSlotsAndBook": {
          "label": "Get Slots & Book",
          "preAction": "getSlots",
          "stateKeys": [{"id":"selectedSlot","type":"string","required":true},{"id":"selectedAppointmentType","type":"string","required":true}],
          "prompt": "Fetch available slots based on selected provider, department, and type. Confirm and book appointment. Update state."
        },
        "end": { "label": "End", "prompt": "Appointment booked successfully." }
      },
      "states": {
        "conversationState": { "currentStep": "getDepartmentsAndProviders", "previousStep": "", "completedSteps": [] },
        "data": { "departments": [], "providers": [], "appointmentTypes": [], "selectedDepartment": {}, "selectedProvider": {}, "selectedAppointmentType": {}, "selectedSlot": {}, "availableSlots": [] },
        "stateKeyValueMap": { "selectedDepartment": "departments", "selectedProvider": "providers", "selectedAppointmentType": "appointmentTypes", "selectedSlot": "availableSlots" }
      },
      "summary": {
        "name": "BookAppointment",
        "workflows": {
          "getDepartmentsAndProviders": { "action":"getDepartmentsAndProviders", "next": ["getAppointmentType"] },
          "getAppointmentType": {"action":"getAppointmentType", "dependsOn": ["getDepartmentsAndProviders"], "next": ["getSlotsAndBook"] },
          "getSlotsAndBook": {"action":"getSlotsAndBook",  "dependsOn": ["getAppointmentType"], "next": ["end"] }
        },
      }
    }
  },
  "states": { "conversationWorkflow": { "currentWorkflow": "", "previousWorkflow": "" }, "data": { "patientInfo": {} } },
  "tools": []
};
