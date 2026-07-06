/**
 * All tool modules related to the Data Cloud Direct API (Profile category).
 * Each module exports:
 * - definition: The MCP tool schema.
 * - handler: The async function to execute when the tool is called.
 */

// --- Tool: get_profile_count ---
const getProfileCount = {
  definition: {
    name: 'get_profile_count',
    description: `Get the total count of unified individual profiles in Data Cloud by querying the UnifiedIndividual__dlm DMO. This reflects unified records after identity resolution — not raw source record counts. Useful as a quick health check or to understand org data volume.

Returns: An object with profileCount (number) and a human-readable message string.

Common errors:
- 401: Authentication token expired.
- 400: UnifiedIndividual__dlm is not available in this org (Data Cloud not fully provisioned).`,
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  handler: async (args, sfClient) => {
    // This one was already correct!
    const count = await sfClient.profile.getProfileCount(); 
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            profileCount: count,
            message: `Total unique profiles: ${count}`,
          }, null, 2),
        },
      ],
    };
  }
};

// --- Tool: get_customer_consent ---
const getCustomerConsent = {
  definition: {
    name: 'get_customer_consent',
    description: `Get the email consent and opt-out status for a specific individual from the UnifiedIndividual__dlm DMO.

Pass the source Individual record ID (IndividualId__c field value) — not the unified ID and not a Salesforce core record ID. If you only have a name or email, query UnifiedIndividual__dlm first using execute_data_cloud_query to find the correct ID.

Returns: An object with found (boolean), email, emailOptOut (boolean), consentStatus, and lastModified. Returns found=false if no record matches the ID.

Common errors:
- 400: Malformed ID format.`,
    inputSchema: {
      type: 'object',
      properties: {
        customerId: {
          type: 'string',
          description: 'The source Individual record ID (value of the IndividualId__c field in UnifiedIndividual__dlm). Not the unified ID or a core Salesforce record ID.',
        },
      },
      required: ['customerId'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || typeof args !== 'object' || !('customerId' in args)) {
      throw new Error('customerId is required');
    }
    const customerId = String(args.customerId);
    // --- UPDATED ---
    const consentData = await sfClient.profile.getCustomerConsent(customerId);

    if (!consentData) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              found: false,
              message: `No customer found with ID: ${customerId}`,
            }),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            found: true,
            customerId: consentData.IndividualId__c,
            email: consentData.Email,
            emailOptOut: consentData.HasOptedOutOfEmail,
            consentStatus: consentData.ConsentStatus__c,
            lastModified: consentData.LastModifiedDate,
          }, null, 2),
        },
      ],
    };
  }
};

// --- Tool: get_all_profile_metadata ---
const getAllProfileMetadata = {
  definition: {
    name: 'get_all_profile_metadata',
    description: 'Get metadata for all profile category DMOs (Individual, Contact Point Email, Unified Individual, Contact Point Address, etc.).',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  handler: async (args, sfClient) => {
    // --- UPDATED ---
    const result = await sfClient.profile.getAllProfileMetadata();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
};

// --- Tool: get_profile_dmo_metadata ---
const getProfileDmoMetadata = {
  definition: {
    name: 'get_profile_dmo_metadata',
    description: 'Get metadata for a specific profile DMO including fields, data types, and relationships.',
    inputSchema: {
      type: 'object',
      properties: {
        dmoApiName: {
          type: 'string',
          description: 'The API name of the profile DMO (e.g., ssot__Individual__dlm)',
        },
      },
      required: ['dmoApiName'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || typeof args !== 'object' || !('dmoApiName' in args)) {
      throw new Error('dmoApiName is required');
    }
    const dmoApiName = String(args.dmoApiName);
    // --- UPDATED ---
    const result = await sfClient.profile.getProfileDmoMetadata(dmoApiName);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
};

// --- Tool: query_profile_dmo ---
const queryProfileDmo = {
  definition: {
    name: 'query_profile_dmo',
    description: 'Query profile DMO records with a filter. The Profile REST endpoint requires a filter clause — use execute_data_cloud_query for unfiltered/list-all use cases.',
    inputSchema: {
      type: 'object',
      properties: {
        dmoApiName: {
          type: 'string',
          description: 'The API name of the profile DMO',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated list of fields to return (e.g., ssot__Id__c,ssot__FirstName__c)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of records to return',
        },
        filters: {
          type: 'string',
          description: 'REQUIRED. Filter criteria in format [field=value] (e.g., [ssot__DataSourceId__c=POS]). The Data Cloud Profile REST API rejects requests without a filter.',
        },
      },
      required: ['dmoApiName', 'filters'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || typeof args !== 'object' || !('dmoApiName' in args) || !('filters' in args)) {
      throw new Error('dmoApiName and filters are required');
    }
    const dmoApiName = String(args.dmoApiName);
    const fields = args.fields ? String(args.fields) : null;
    const limit = args.limit ? Number(args.limit) : null;
    const filters = args.filters ? String(args.filters) : null;

    // --- UPDATED ---
    const result = await sfClient.profile.queryProfileDmo(dmoApiName, fields, limit, filters);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
};

// --- Tool: query_profile_dmo_by_id ---
const queryProfileDmoById = {
  definition: {
    name: 'query_profile_dmo_by_id',
    description: 'Query a specific profile DMO record by its ID with optional field selection and filters.',
    inputSchema: {
      type: 'object',
      properties: {
        dmoApiName: {
          type: 'string',
          description: 'The API name of the profile DMO',
        },
        dmoRecordId: {
          type: 'string',
          description: 'The record ID to query',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated list of fields to return',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of records to return',
        },
        filters: {
          type: 'string',
          description: 'Filter criteria in format [field=value]',
        },
      },
      required: ['dmoApiName', 'dmoRecordId'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || typeof args !== 'object' || !('dmoApiName' in args) || !('dmoRecordId' in args)) {
      throw new Error('dmoApiName and dmoRecordId are required');
    }
    const dmoApiName = String(args.dmoApiName);
    const dmoRecordId = String(args.dmoRecordId);
    const fields = args.fields ? String(args.fields) : null;
    const limit = args.limit ? Number(args.limit) : null;
    const filters = args.filters ? String(args.filters) : null;

    // --- UPDATED ---
    const result = await sfClient.profile.queryProfileDmoById(dmoApiName, dmoRecordId, fields, limit, filters);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
};

// --- Tool: query_profile_dmo_by_search_key ---
const queryProfileDmoBySearchKey = {
  definition: {
    name: 'query_profile_dmo_by_search_key',
    description: 'Query profile DMO records using a search key field (e.g., search by email, last name, etc.).',
    inputSchema: {
      type: 'object',
      properties: {
        dmoApiName: {
          type: 'string',
          description: 'The API name of the profile DMO',
        },
        searchKey: {
          type: 'string',
          description: 'The field name to search on (e.g., ssot__DataSourceId__c)',
        },
        searchKeyValue: {
          type: 'string',
          description: 'The value to search for',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated list of fields to return',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of records to return',
        },
        filters: {
          type: 'string',
          description: 'Additional filter criteria',
        },
      },
      required: ['dmoApiName', 'searchKey', 'searchKeyValue'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || typeof args !== 'object' ||
        !('dmoApiName' in args) || !('searchKey' in args) || !('searchKeyValue' in args)) {
      throw new Error('dmoApiName, searchKey, and searchKeyValue are required');
    }
    const dmoApiName = String(args.dmoApiName);
    const searchKey = String(args.searchKey);
    const searchKeyValue = String(args.searchKeyValue);
    const fields = args.fields ? String(args.fields) : null;
    const limit = args.limit ? Number(args.limit) : null;
    const filters = args.filters ? String(args.filters) : null;

    // --- UPDATED ---
    const result = await sfClient.profile.queryProfileDmoBySearchKey(
      dmoApiName, searchKey, searchKeyValue, fields, limit, filters
    );
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
};

// --- Tool: query_profile_parent_child_by_id ---
const queryProfileParentChildById = {
  definition: {
    name: 'query_profile_parent_child_by_id',
    description: 'Query a parent profile DMO and its related child DMOs by parent record ID (e.g., get an Individual and all their Contact Points).',
    inputSchema: {
      type: 'object',
      properties: {
        dmoParentApiName: {
          type: 'string',
          description: 'The API name of the parent DMO',
        },
        dmoParentRecordId: {
          type: 'string',
          description: 'The parent record ID',
        },
        dmoChildApiName: {
          type: 'string',
          description: 'The API name of the child DMO',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated list of fields to return from child records',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of child records to return',
        },
      },
      required: ['dmoParentApiName', 'dmoParentRecordId', 'dmoChildApiName'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || typeof args !== 'object' ||
        !('dmoParentApiName' in args) || !('dmoParentRecordId' in args) || !('dmoChildApiName' in args)) {
      throw new Error('dmoParentApiName, dmoParentRecordId, and dmoChildApiName are required');
    }
    const dmoParentApiName = String(args.dmoParentApiName);
    const dmoParentRecordId = String(args.dmoParentRecordId);
    const dmoChildApiName = String(args.dmoChildApiName);
    const fields = args.fields ? String(args.fields) : null;
    const limit = args.limit ? Number(args.limit) : null;

    // --- UPDATED ---
    const result = await sfClient.profile.queryProfileParentChildById(
      dmoParentApiName, dmoParentRecordId, dmoChildApiName, fields, limit
    );
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
};

// --- Tool: query_profile_parent_child_by_search_key ---
const queryProfileParentChildBySearchKey = {
  definition: {
    name: 'query_profile_parent_child_by_search_key',
    description: 'Query a parent profile DMO and its related child DMOs using a search key on the parent.',
    inputSchema: {
      type: 'object',
      properties: {
        dmoParentApiName: {
          type: 'string',
          description: 'The API name of the parent DMO',
        },
        searchKey: {
          type: 'string',
          description: 'The field name to search on the parent',
        },
        searchKeyValue: {
          type: 'string',
          description: 'The value to search for',
        },
        dmoChildApiName: {
          type: 'string',
          description: 'The API name of the child DMO',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated list of fields to return from child records',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of child records to return',
        },
      },
      required: ['dmoParentApiName', 'searchKey', 'searchKeyValue', 'dmoChildApiName'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || typeof args !== 'object' ||
        !('dmoParentApiName' in args) || !('searchKey' in args) ||
        !('searchKeyValue' in args) || !('dmoChildApiName' in args)) {
      throw new Error('dmoParentApiName, searchKey, searchKeyValue, and dmoChildApiName are required');
    }
    const dmoParentApiName = String(args.dmoParentApiName);
    const searchKey = String(args.searchKey);
    const searchKeyValue = String(args.searchKeyValue);
    const dmoChildApiName = String(args.dmoChildApiName);
    const fields = args.fields ? String(args.fields) : null;
    const limit = args.limit ? Number(args.limit) : null;

    // --- UPDATED ---
    const result = await sfClient.profile.queryProfileParentChildBySearchKey(
      dmoParentApiName, searchKey, searchKeyValue, dmoChildApiName, fields, limit
    );
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
};

// --- Tool: query_profile_calculated_insights ---
const queryProfileCalculatedInsights = {
  definition: {
    name: 'query_profile_calculated_insights',
    description: 'Query calculated insights for a specific profile DMO record with dimensions, measures, and filters.',
    inputSchema: {
      type: 'object',
      properties: {
        dmoApiName: {
          type: 'string',
          description: 'The API name of the profile DMO',
        },
        dmoRecordId: {
          type: 'string',
          description: 'The record ID',
        },
        insightName: {
          type: 'string',
          description: 'The name of the calculated insight',
        },
        batchSize: {
          type: 'number',
          description: 'Batch size for pagination',
        },
        dimensions: {
          type: 'string',
          description: 'Comma-separated list of dimensions',
        },
        measures: {
          type: 'string',
          description: 'Comma-separated list of measures',
        },
        filters: {
          type: 'string',
          description: 'Filter criteria',
        },
      },
      required: ['dmoApiName', 'dmoRecordId', 'insightName'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || typeof args !== 'object' ||
        !('dmoApiName' in args) || !('dmoRecordId' in args) || !('insightName' in args)) {
      throw new Error('dmoApiName, dmoRecordId, and insightName are required');
    }
    const dmoApiName = String(args.dmoApiName);
    const dmoRecordId = String(args.dmoRecordId);
    const insightName = String(args.insightName);
    const batchSize = args.batchSize ? Number(args.batchSize) : null;
    const dimensions = args.dimensions ? String(args.dimensions) : null;
    const measures = args.measures ? String(args.measures) : null;
    const filters = args.filters ? String(args.filters) : null;

    // --- UPDATED ---
    const result = await sfClient.profile.queryProfileCalculatedInsights(
      dmoApiName, dmoRecordId, insightName, batchSize, dimensions, measures, filters
    );
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
};


// --- Export all tools in an array ---
export const profileTools = [
  getProfileCount,
  getCustomerConsent,
  getAllProfileMetadata,
  getProfileDmoMetadata,
  queryProfileDmo,
  queryProfileDmoById,
  queryProfileDmoBySearchKey,
  queryProfileParentChildById,
  queryProfileParentChildBySearchKey,
  queryProfileCalculatedInsights,
];