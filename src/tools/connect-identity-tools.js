/**
 * All tool modules related to the Data Cloud Connect API (Identity Resolution).
 * Tool names are prefixed with 'connect_'.
 */

// --- Tool: connect_get_identity_resolution_rulesets ---
const getIdentityResolutionRulesets = {
  definition: {
    name: 'connect_get_identity_resolution_rulesets',
    description: `
      Get a list of all Identity Resolution rulesets from Data Cloud.
      Use this tool to **discover available rulesets** or to find the API name/ID of a specific ruleset.

      Use cases:
      - List all rulesets to see which ones are 'Active'.
      - Find the specific 'developerName' or 'id' of a ruleset you know by its 'displayName'.
      - Audit all rulesets within a specific dataspace.

      Returns: An object containing a 'rulesets' array, each with fields like 'id', 'developerName', 'displayName', 'status', and 'dataspace'.

      Common errors:
      - 400: Invalid dataspace name.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        dataspace: { type: 'string', description: 'Optional. The dataspace to query. If not provided, the "default" dataspace is used.' },
      },
      required: [],
    },
  },
  handler: async (args, sfClient) => {
    // 'args' will be an object with optional properties, e.g., { dataspace: 'default' }
    const result = await sfClient.connectIdentity.getIdentityResolutionRulesets(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
};

// --- Tool: connect_get_identity_resolution_ruleset_by_name ---
const getIdentityResolutionRulesetByName = {
  definition: {
    name: 'connect_get_identity_resolution_ruleset_by_name',
    description: `
      Get the complete details for a single Identity Resolution ruleset by its API name or ID.
      Use this tool to **inspect the configuration** of a specific ruleset.

      Use cases:
      - Check the 'status' ('Active', 'Draft', 'InProgress') of a ruleset.
      - Inspect the 'matchRules' and 'reconciliationRules' of a ruleset.
      - Get the 18-character 'id' when you only have the 'developerName'.

      Returns: A single, detailed ruleset object including all its configuration.

      Common errors:
      - 404: No ruleset found with the specified name or ID.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        rulesetNameOrId: { type: 'string', description: 'The API name (e.g., "Individual_Ruleset") or 18-character ID (e.g., "0IR...") of the ruleset.' },
      },
      required: ['rulesetNameOrId'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || !args.rulesetNameOrId) {
      throw new Error('rulesetNameOrId is required');
    }
    const result = await sfClient.connectIdentity.getIdentityResolutionRulesetByName(args.rulesetNameOrId);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
};

// --- Tool: connect_run_identity_resolution_ruleset_now ---
const runIdentityResolutionRulesetNow = {
  definition: {
    name: 'connect_run_identity_resolution_ruleset_now',
    description: `
      Triggers an immediate, asynchronous run of a specific Identity Resolution ruleset.
      This tool **starts a job** to match and unify profiles based on the ruleset's configuration.

      Use cases:
      - Manually trigger a ruleset run after a large data ingest.
      - Start the unification process for testing a new or modified ruleset.
      - Refresh unified profiles on demand.

      Note: This is an asynchronous 'action'. The tool returns a status for the *job initiation*, not the completed run.

      Returns: A response indicating the run was successfully triggered, often with a job ID or status.

      Common errors:
      - 404: No ruleset found with the specified name or ID.
      - 409: A run for this ruleset is already in progress.
      - 400: The ruleset is not in an 'Active' state and cannot be run.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        rulesetNameOrId: { type: 'string', description: 'The API name (e.g., "Individual_Ruleset") or 18-character ID (e.g., "0IR...") of the ruleset to run.' },
        body: { type: 'string', description: 'Optional. A JSON string for run parameters. For a standard run, this can be omitted or an empty object "{}".' },
      },
      required: ['rulesetNameOrId'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || !args.rulesetNameOrId) {
      throw new Error('rulesetNameOrId is required');
    }
    let runBody = null;
    if (args.body) {
      try {
        runBody = JSON.parse(args.body);
      } catch (e) {
        throw new Error('body, if provided, must be a valid JSON string.');
      }
    }
    
    const result = await sfClient.connectIdentity.runIdentityResolutionRulesetNow(args.rulesetNameOrId, runBody);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
};


// --- Export all tools in an array ---
export const connectIdentityTools = [
  getIdentityResolutionRulesets,
  getIdentityResolutionRulesetByName,
  runIdentityResolutionRulesetNow,
];