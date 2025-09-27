const a = {
  workflows: {
    patientsearch: {
      name: "patientsearch",
      description: "Handles patient search verification",
      nodes: {
        collectIdentifiers: {
          isFirstNode: true,
          preAction: [],
          stateKeys: [{ id: "verified", required: true }],
          postAction: [],
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
                  required: true,
                },
              ],
            },
          ],
          prompt:
            "Say 'I'd need your details to check in our system. Can you provide your full name and date of birth please?' Collect the user's full name (first and last) and date of birth, skipping any information they've already provided. Do not add extra phrases or say 'verifying or verify' anywhere. If any detail is missing or entered incorrectly, ask again until it is valid. Do not proceed until all required information is collected. Once confirmed, trigger the lookupPatient tool and tell the user: 'Please wait while I pull up your information.' ",
          edges: [
            {
              nodeName: "newPaitent",
              condition:
                "if the paitent not found in our system after 2 attempts",
              stateKeys: [],
            },
          ],
        },
        newPaitent: {
          prompt:
            "informt he user you will be tread as new paitent and continue the flow",
        },
        end: {
          prompt:
            "If the caller has already stated their intent, carry it forward after completing patientsearch. Do not ask them again what they need unless it was not specified. Directly trigger the scenario using chooseScenario tool that matches their original intent without seeking confirmation",
        },
      },
      states: {
        conversationState: {
          currentStep: "collectIdentifiers",
          previousStep: "",
          completedSteps: [],
        },
        data: {
          verified: false,
        },
      },
      summary: {
        name: "patientsearch",
        workflows: {
          collectIdentifiers: {
            action: "collectIdentifiers",
          },
        },
      },
    },

    bookAppointment: {
      name: "bookAppointment",
      description: "Handles patient appointment booking and setup appointment",
      requiredWorkflow: {
        must: ["patientsearch"],
        desc: "patientsearch is required before booking an appointment plse trigger patientsearch scenario if it is already completed make sure you have called end node patientsearch",
      },
      nodes: {
        getProviders: {
          isFirstNode: true,
          label: "Fetch Departments & Providers",
          preAction: ["fetchDepartmentsAndProviders"],
          stateKeys: [
            {
              id: "selectedProvider",
              required: true,
              nodeAffects: {
                name: "getAppointmentTypes",
                description:
                  "The provider has been changed. Because of this update, we've triggered the getAppointmentTypes step to refresh the available appointment types for the newly selected provider and department. Ask the user to select an appointment type again from the updated list, update the state accordingly, and then proceed to the next step",
              },
            },
          ],
          prompt:
            "Thank you, I was able to pull up your information. Could you please share the name of the provider with whom you'd like to schedule an appointment? Wait for the user's response before showing any options and ensure that you have a first and a last name for the provider. If given partially, ask for the remaining details. If the user provides a name, confirm it against the available list. If provider isn't available, inform the user and ask if they would like to choose from the available options. List out the available providers if the user has not provided a specific name and let the user select a provider. Once the user selects a provider, proceed to next Node.",
        },
        getAppointmentTypes: {
          label: "Fetch Appointment Type",
          preAction: ["getAppointmentTypes"],
          stateKeys: [
            {
              id: "selectedAppointmentType",
              required: true,
              description:
                "Ensure that the user has an appointment type selected. If one is already provided, update the state and proceed without prompting the user again. If none is provided, ask the user for it. (Do not expose this logic to the user if they have already given the appointment type.)",
              nodeAffects: {
                name: "getSlotsAndBook",
                description:
                  "The appointment type has been changed. Because of this update, the getSlotsAndBook step has been triggered to refresh the available slots for the newly selected appointment type. If it is not different from the previous one, no action needs to be taken by the user. The user should be asked to select a slot from the updated list, the state should be updated accordingly, and then the next step should be proceeded with.",
              },
            },
          ],
          prompt:
            "Thank the user, then ask them to choose the type of appointment they would like to book. Present the available options and ask which one works best for them. Once the user confirms, proceed directly to the next node. Do not say phrases like 'Let me check on available slots for you'—just move to the next node.",
        },
        getSlotsAndBook: {
          preAction: ["getSlots"],
          stateKeys: [
            {
              id: "selectedSlot",
              required: true,
              description: "",
            },
          ],
          tools: [
            {
              name: "getAvailableSlots",
              description: "to get filtered slots",
              parameters: [
                {
                  id: "date",
                  type: "string (auto-convert user input to MM/DD/YYYY)",
                  required: true,
                },
              ],
            },
          ],
          postAction: ["bookAppointment"],
          prompt: `
                              Step 1: Ask for Preferred Date
                                  Ask the user if they have a preferred date for their appointment.

                              Step 2: Handle User’s Date Response

                                  When the user provides a date, immediately call the getAvailableSlots tool using excuteTool for that date.

                                  Say: “Okay, let me check if we have availability on [date].”

                                  Do not wait for another user response before calling the tool.

                                  Only mention the “our team will call” fallback if 3 attempts fail.
            
            `,
        },
      },
      states: {
        conversationState: {
          currentStep: "getProviders",
          previousStep: "",
          completedSteps: [],
        },
        data: {
          providers: [],
          appointmentTypes: [],
          selectedProvider: {},
          selectedAppointmentType: {},
          selectedSlot: {},
          availableSlots: [],
        },
        stateKeyValueMap: {
          selectedProvider: "providers",
          selectedAppointmentType: "appointmentTypes",
          selectedSlot: "availableSlots",
        },
      },
      summary: {
        name: "BookAppointment",
        workflows: {
          getProviders: {
            action: "getProviders",
            dependsOn: [],
            next: ["getAppointmentTypes"],
          },
          getAppointmentTypes: {
            action: "getAppointmentTypes",
            dependsOn: ["getProviders"],
            next: ["getSlotsAndBook"],
          },
          getSlotsAndBook: {
            action: "getSlotsAndBook",
            dependsOn: ["getAppointmentTypes"],
          },
        },
      },
    },
  },
  states: {
    conversationState: {
      currentWorkflow: "",
      previousWorkflow: "",
      completedWorkflows: [],
    },
    data: {
      patientInfo: {},
      appointments: [],
    },
  },
};
