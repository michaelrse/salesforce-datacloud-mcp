/**
 * All tool modules related to the core Salesforce REST API (Utility).
 * Tool names are prefixed with 'core_'.
 */

// --- Tool: core_get_org_limits ---
const getOrgLimits = {
  definition: {
    name: 'core_get_org_limits',
    description: `
      Gets a list of all allocation-based limits for your Salesforce org.
      Use this tool to **check consumption and remaining allocations** for major org capabilities.

      Use cases:
      - Check remaining 'DailyApiRequests' before running a large data job.
      - Monitor 'DataStorageMB' and 'FileStorageMB' to see how much org space is left.
      - Check consumption of 'MonthlyDataCloudCredits'.
      - See how many 'CustomObject' or 'PlatformEvent' allocations are remaining.

      Returns: A JSON object where each key is a limit name (e.g., "DailyApiRequests", "MonthlyDataCloudCredits").
      Each limit has a 'Max' (total allocation) and 'Remaining' value.

      Example Response Snippet:
      \`\`\`json
      {
        "DailyApiRequests": {
          "Max": 1000000,
          "Remaining": 987654
        },
        "MonthlyDataCloudCredits": {
          "Max": 5000000,
          "Remaining": 1234567
        }
      }
      \`\`\`

      Common errors:
      - 403: User does not have the "View Setup and Configuration" permission.
    `,
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  handler: async (args, sfClient) => {
    // This tool takes no arguments
    const result = await sfClient.coreUtility.getOrgLimits();
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
};

// --- Export all tools in an array ---
export const coreUtilityTools = [
  getOrgLimits,
];
