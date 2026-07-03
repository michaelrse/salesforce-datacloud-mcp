/**
 * Tools that provide access to cached resources.
 * These bridge the gap between MCP resources and callable tools.
 */

export const resourceAccessTools = [
  {
    definition: {
      name: 'get_all_dmos',
      description: 'Get the complete list of all Data Model Objects (DMOs) available in Data Cloud, including their developerName, label, category, and status. Results are cached after the first call. Use this to discover DMO names before calling get_dmo_schema or running queries.',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    },
    handler: async (args, sfClient) => {
      try {
        const result = await sfClient.connectDataModel.getDataModelObjects({});
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        throw new Error(`Failed to get DMOs: ${error.message}`);
      }
    }
  },
  {
    definition: {
      name: 'get_dmo_schema',
      description: 'Get the complete schema for a specific DMO including all fields, data types, relationships, and indexes. Uses cached data when available.',
      inputSchema: {
        type: 'object',
        properties: {
          dmoName: {
            type: 'string',
            description: 'DMO API name (e.g., "ssot__Individual__dlm", "UnifiedIndividual__dlm", "ssot__ContactPointEmail__dlm")'
          },
          forceRefresh: {
            type: 'boolean',
            description: 'If true, bypasses cache and fetches fresh data from API',
            default: false
          }
        },
        required: ['dmoName']
      }
    },
    handler: async (args, sfClient) => {
      try {
        const { dmoName, forceRefresh = false } = args;
        const result = await sfClient.connectDataModel.getDataModelObjectByName(dmoName, forceRefresh);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        throw new Error(`Failed to get DMO schema for ${args.dmoName}: ${error.message}`);
      }
    }
  },
  {
    definition: {
      name: 'get_cached_metadata',
      description: 'Get all cached Data Cloud metadata including DMOs, fields, categories, and relationships. This is the most comprehensive metadata call - uses cache to avoid API limits.',
      inputSchema: {
        type: 'object',
        properties: {
          metadataType: {
            type: 'string',
            description: 'Type of metadata to retrieve',
            enum: ['DataCloud', 'DataGraph', 'CalculatedInsight'],
            default: 'DataCloud'
          },
          forceRefresh: {
            type: 'boolean',
            description: 'If true, bypasses cache and fetches fresh data from API',
            default: false
          }
        },
        required: []
      }
    },
    handler: async (args, sfClient) => {
      try {
        const { metadataType = 'DataCloud', forceRefresh = false } = args;
        const result = await sfClient.metadata.getMetadata(metadataType, forceRefresh);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        throw new Error(`Failed to get cached metadata: ${error.message}`);
      }
    }
  }
];