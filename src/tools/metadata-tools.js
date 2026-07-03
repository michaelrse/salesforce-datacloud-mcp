/**
 * All tool modules related to the Data Cloud Direct API (Metadata).
 * Each module exports:
 * - definition: The MCP tool schema.
 * - handler: The async function to execute when the tool is called.
 */

// --- Tool: get_data_cloud_schema ---
const getDataCloudSchema = {
  definition: {
    name: 'get_data_cloud_schema',
    description: `Get the complete Data Cloud schema — all Data Model Objects (DMOs) with their fields, data types, and relationships in one call.

Use cases:
- Get a full picture of what data is available in Data Cloud before writing queries.
- Find all DMOs and their field lists in a single request.
- Use this when you need to explore multiple DMOs at once; use get_object_metadata for a single DMO.

Returns: An array of DMO objects. Each entry includes the DMO name, label, category, and a 'fields' array with field names, types, and metadata.

Common errors:
- 401: Authentication token expired — re-authenticate and retry.`,
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  handler: async (args, sfClient) => {
    // --- UPDATED ---
    const schema = await sfClient.metadata.getDataCloudSchema();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(schema, null, 2),
        },
      ],
    };
  }
};

// --- Tool: list_data_model_objects ---
const listDataModelObjects = {
  definition: {
    name: 'list_data_model_objects',
    description: 'List all available Data Model Objects (DMOs) in Data Cloud with their names and basic info',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  handler: async (args, sfClient) => {
    // --- UPDATED ---
    const objects = await sfClient.metadata.listDataModelObjects();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            totalObjects: objects.length,
            objects: objects
          }, null, 2),
        },
      ],
    };
  }
};

// --- Tool: get_object_metadata ---
const getObjectMetadata = {
  definition: {
    name: 'get_object_metadata',
    description: 'Get detailed metadata for a specific Data Model Object including all fields, data types, and relationships',
    inputSchema: {
      type: 'object',
      properties: {
        entityName: {
          type: 'string',
          description: 'The name of the Data Model Object (e.g., ssot__Individual__dlm)',
        },
      },
      required: ['entityName'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || typeof args !== 'object' || !('entityName' in args)) {
      throw new Error('entityName is required');
    }
    const entityName = String(args.entityName);
    // --- UPDATED ---
    const metadata = await sfClient.metadata.getObjectMetadata(entityName);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(metadata, null, 2),
        },
      ],
    };
  }
};

// --- Tool: get_metadata_by_category ---
const getMetadataByCategory = {
  definition: {
    name: 'get_metadata_by_category',
    description: `Get all Data Model Objects (DMOs) belonging to a specific Data Cloud category.

Use cases:
- List all Profile DMOs (Individual, ContactPoint*) in one call.
- Scope your schema exploration to a single domain without loading the entire schema.

Valid category values: Profile, Engagement, Other, B2BAccount, B2BContact, B2BOpportunity.
When unsure which category a DMO belongs to, call get_data_cloud_schema first and check the 'category' field on each DMO.

Returns: Same structure as get_data_cloud_schema but filtered to the requested category.

Common errors:
- 400: Invalid or misspelled category value.`,
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'The category to filter by. Valid values: Profile, Engagement, Other, B2BAccount, B2BContact, B2BOpportunity.',
        },
      },
      required: ['category'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || typeof args !== 'object' || !('category' in args)) {
      throw new Error('category is required');
    }
    const category = String(args.category);
    // --- UPDATED ---
    const metadata = await sfClient.metadata.getMetadataByCategory(category);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(metadata, null, 2),
        },
      ],
    };
  }
};

// --- Export all tools in an array ---
export const metadataTools = [
  getDataCloudSchema,
  listDataModelObjects,
  getObjectMetadata,
  getMetadataByCategory,
];