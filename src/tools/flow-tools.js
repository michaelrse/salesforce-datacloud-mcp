/**
 * Salesforce Flow metadata tools.
 * Uses the Tooling API to list, inspect, and filter Flows in the org.
 * Tool names are prefixed with "flow_".
 */

// ─── List Flows ────────────────────────────────────────────────────────────

const listFlows = {
  definition: {
    name: 'flow_list',
    description: `
      Retrieve a list of Flows in your Salesforce org via the Tooling API.

      Use cases:
      - List all flows to find one by MasterLabel.
      - Filter by Status ("Active", "Draft", "Obsolete", "InvalidDraft").
      - Filter by ProcessType ("Flow", "AutoLaunchedFlow", "Workflow", etc.).
      - Find campaign-associated flows (use the 'flow_list_campaign_flows' tool, which is a wrapper).

      Returns: A Tooling API SOQL response with a 'records' array. Each record includes:
      - Id: The 18-char Flow version Id (e.g. "301...").
      - MasterLabel: Display label of the flow.
      - ApiVersion, Status, ProcessType.
      - Definition.DeveloperName: The unique API name of the flow.
      - CreatedDate, LastModifiedDate.

      Note: Campaign flows follow the naming format flow_{campaignId}_{epochMs}.

      Common errors:
      - 400: Invalid filter value (check Status / ProcessType spellings).
      - 403: Insufficient permissions to query Flow metadata.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Optional. Filter by Status. One of: "Active", "Draft", "Obsolete", "InvalidDraft".',
        },
        processType: {
          type: 'string',
          description: 'Optional. Filter by ProcessType (e.g. "Flow", "AutoLaunchedFlow", "Workflow", "CustomEvent").',
        },
        namePrefix: {
          type: 'string',
          description: 'Optional. SOQL LIKE prefix on MasterLabel. Example: "flow_701" to find flows for a specific campaign.',
        },
        limit: {
          type: 'number',
          description: 'Optional. Max number of records to return.',
        },
      },
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.flow.listFlows(args);
  },
};

// ─── Get Flow ──────────────────────────────────────────────────────────────

const getFlow = {
  definition: {
    name: 'flow_get',
    description: `
      Retrieve a single Flow record by its 18-character Id (starts with "301...").
      Returns the full Flow sObject record from the Tooling API, including the Metadata blob
      that describes the flow's structure (variables, decisions, actions, etc.).

      To find a Flow Id, first call 'flow_list' or 'flow_list_definitions'.

      Returns: The Flow record object. Notable fields:
      - MasterLabel, Status, ProcessType, ApiVersion.
      - Metadata: The full flow definition as a JSON object.
      - Definition.DeveloperName: The flow's API name.

      Common errors:
      - 404: Flow Id not found.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        flowId: {
          type: 'string',
          description: 'Required. The 18-character Id of the Flow record (e.g. "301...").',
        },
      },
      required: ['flowId'],
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.flow.getFlow(args.flowId);
  },
};

// ─── List Flow Definitions ─────────────────────────────────────────────────

const listFlowDefinitions = {
  definition: {
    name: 'flow_list_definitions',
    description: `
      List Flow Definitions in your org. A FlowDefinition is the "header" of a logical flow —
      one per flow, regardless of how many versions exist. Useful to see which version is active.

      Returns: A Tooling API SOQL response with a 'records' array. Each record includes:
      - Id: FlowDefinition Id (starts with "300...").
      - DeveloperName, MasterLabel, NamespacePrefix.
      - ActiveVersionId: Id of the currently active Flow version (or null if no active version).
      - LatestVersionId: Id of the most recently saved version.

      Common errors:
      - 403: Insufficient permissions.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Optional. Max number of records to return.',
        },
      },
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.flow.listFlowDefinitions(args);
  },
};

// ─── List Campaign Flows ───────────────────────────────────────────────────

const listCampaignFlows = {
  definition: {
    name: 'flow_list_campaign_flows',
    description: `
      List flows that are associated with Marketing Cloud campaigns.
      Campaign flows follow the naming pattern: flow_{campaignId}_{epochTimeMs}.

      Use cases:
      - List all campaign-associated flows (omit campaignId).
      - List flows for a specific campaign (pass that campaign's 18-char Id).

      Returns: A Tooling API SOQL response with a 'records' array of matching Flow records.

      Common errors:
      - 403: Insufficient permissions.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        campaignId: {
          type: 'string',
          description: 'Optional. The 18-char Campaign Id to filter by. If omitted, all campaign-associated flows are returned.',
        },
      },
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.flow.listCampaignFlows(args.campaignId);
  },
};

// ─── Invoke Flow (On-Demand / Transactional) ───────────────────────────────

const invokeFlow = {
  definition: {
    name: 'flow_invoke',
    description: `
      Invoke an On-Demand Flow via REST API to trigger transactional messaging
      (e.g. one-time passwords, order confirmations) from Marketing Cloud Next.

      Endpoint: POST /services/data/{apiVersion}/actions/custom/flow/{flowApiName}

      Prerequisites (must be set up in the org first):
      - An Apex class defining the personalization structure (input variables).
      - A transactional CMS email referencing that Apex class as a data source.
      - An On-Demand Flow with an Apex-Defined variable marked "Available for Input"
        and a "Send Email" element pointing to the published transactional email.

      The 'inputs' parameter is an array of objects. Each object represents one
      Flow run. Keys in the object must match the Flow's "Available for Input"
      resource API names exactly.

      Example inputs:
      [
        {
          "EmailAddress": "jen.doe@example.com",
          "IndividualID": "4001CD4A",
          "OTP": {
            "FirstName": "Jen",
            "otpCode": "4567"
          }
        }
      ]

      Returns: An array of action results. Each entry includes:
      - actionName: The Flow API name.
      - isSuccess: true if the Flow ran successfully.
      - errors: null on success, or an array of error objects on failure.

      Example response:
      [
        {
          "actionName": "Send_OTP_Email",
          "errors": null,
          "isSuccess": true
        }
      ]

      Common errors:
      - 400: 'inputs' shape does not match the Flow's input variables.
      - 404: Flow API name not found or Flow is not Active.
      - 403: External Client App lacks the required OAuth scopes (need 'full' and 'api').
    `,
    inputSchema: {
      type: 'object',
      properties: {
        flowApiName: {
          type: 'string',
          description: 'Required. The API name of the On-Demand Flow to invoke (e.g. "Send_OTP_Email").',
        },
        inputs: {
          type: 'array',
          items: { type: 'object' },
          description: 'Required. Array of input objects. Each object is one Flow run. Keys must match the Flow\'s "Available for Input" resource API names.',
        },
      },
      required: ['flowApiName', 'inputs'],
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.flow.invokeFlow(args.flowApiName, args.inputs);
  },
};

// ─── Export ────────────────────────────────────────────────────────────────

export const flowTools = [
  listFlows,
  getFlow,
  listFlowDefinitions,
  listCampaignFlows,
  invokeFlow,
];
