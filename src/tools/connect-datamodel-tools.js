/**
 * All tool modules related to the Data Cloud Connect API (Data Model).
 * Tool names are prefixed with 'connect_'.
 */

// --- Tool: connect_get_data_model_object_mappings ---
// This stays as a tool because it has dynamic filtering
/**
 * Tool to get a list of all Data Model Objects (DMOs).
 * Converted from the 'allDMOsResource'.
 */
const getDataModelObjectsList = {
  definition: {
    name: 'connect_get_data_model_objects_list',
    description: `
      Get a list of all Data Model Objects (DMOs) available in the dataspace.
      This is the best way to **discover** what DMOs exist before
      using 'connect_get_dmo_schema' to get the schema for a specific one.
      
      Returns: An object with a 'dataModelObjects' array, where each entry
      shows DMO metadata (e.g., 'developerName', 'label', 'category', 'status').
    `,
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Optional. Number of results per page.' },
        offset: { type: 'number', description: 'Optional. Offset for pagination.' },
        orderby: { type: 'string', description: 'Optional. Field to order by (e.g., "developerName asc").' }
      },
      required: [],
    },
  },
  handler: async (args, sfClient) => {
    // The handler from your resource file already calls the correct service!
    // We just need to pass the 'args' from the tool into it.
    const result = await sfClient.connectDataModel.getDataModelObjects(args);
    
    // Return in the standard tool format
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
};

const getDataModelObjectMappings = {
  definition: {
    name: 'connect_get_data_model_object_mappings',
    description: `
      Get a list of mappings between Data Lake Objects (DLOs) and Data Model Objects (DMOs).
      This is crucial for **understanding data lineage** and how source data populates the unified model.

      Use cases:
      - Find out which DLOs are mapped *to* the "ssot__Individual__dlm" DMO.
      - See where a specific DLO (like "Salesforce_Contact_DLO__dlm") is mapped *from*.
      - Audit all mappings in a given dataspace.
      - Check the specific field-to-field mappings (e.g., "Contact_DLO.Email" -> "Individual_DMO.Email__c").

      Common patterns:
      - To find all mappings *to* a specific DMO: \`{"dmoName": "ssot__Individual__dlm"}\`
      - To find all mappings *from* a specific DLO: \`{"dloName": "Salesforce_Contact_DLO__dlm"}\`
      
      Returns: An object with a 'mappings' array, where each entry shows 'dloName', 'dmoName', 'dmoAttributeName', 'dloAttributeName', and other mapping details.

      Common errors:
      - 400: Invalid 'dmoName' or 'dloName' provided.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        dataspace: { type: 'string', description: 'Optional. The dataspace to query. Defaults to "default".' },
        dloName: { type: 'string', description: 'Optional. Filter by a specific Data Lake Object (DLO) API name.' },
        dmoName: { type: 'string', description: 'Optional. Filter by a specific Data Model Object (DMO) API name.' },
        limit: { type: 'number', description: 'Optional. Number of results per page.' },
        offset: { type: 'number', description: 'Optional. Offset for pagination.' },
      },
      required: [],
    },
  },
  handler: async (args, sfClient) => {
    const result = await sfClient.connectDataModel.getDataModelObjectMappings(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
};

// OPTIONAL: Keep a tool for dynamic DMO lookup if needed
const getSpecificDMOSchema = {
  definition: {
    name: 'connect_get_dmo_schema',
    description: `
      Get the complete field-level schema for any Data Model Object (DMO) by its API name or ID.
      Use this to inspect field names, data types, primary keys, and indexes for a specific DMO.

      Use cases:
      - Look up field names before writing a Data Cloud SQL query.
      - Check whether a field is a primary key or has an index.
      - Discover custom fields added to a standard DMO.

      Returns: A DMO object with a 'fields' array. Each field includes:
      - name: API name (e.g., "ssot__FirstName__c")
      - label: Human-readable label
      - type: Data type ("Text", "Number", "Boolean", "DateTime", etc.)
      - isPrimaryKey: true if this field is the DMO's primary key
      - isDistinct / isMapped: Additional schema flags

      Common errors:
      - 404: No DMO found with the given name or ID.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        dmoNameOrId: { type: 'string', description: 'The API name or ID of the DMO.' },
      },
      required: ['dmoNameOrId'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || !args.dmoNameOrId) {
      throw new Error('dmoNameOrId is required');
    }
    const result = await sfClient.connectDataModel.getDataModelObjectByName(args.dmoNameOrId);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
};

// --- Export all tools in an array ---
export const connectDataModelTools = [
  getDataModelObjectsList,
  getDataModelObjectMappings,
  getSpecificDMOSchema, // Optional - for custom/uncommon DMOs
];