/**
 * All tool modules related to the Data Cloud Direct API (Query, CI, and Data Graph).
 * Each module exports:
 * - definition: The MCP tool schema.
 * - handler: The async function to execute when the tool is called.
 */

// --- Tool: execute_data_cloud_query ---
const executeDataCloudQuery = {
  definition: {
    name: 'execute_data_cloud_query',
    description: `Executes a synchronous SQL query against Data Cloud (Query API V1). Best for queries that return a small or known number of records (e.g., under 10k rows) or when using a 'limit' clause. The entire result set is returned in a single, synchronous response.
WARNING: For queries that might return large datasets, this tool may time out or fail. Use 'execute_data_cloud_query_v2' for large-volume or paginated queries.`,
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The SQL query to execute in ANSI SQL standard format',
        },
        limit: {
          type: 'number',
          description: 'Optional: Limit the number of records returned (useful for browser-based clients or testing). If not specified, returns all matching records.',
        },
      },
      required: ['query'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || typeof args !== 'object' || !('query' in args)) {
      throw new Error('query is required');
    }
    const query = String(args.query);
    const limit = args.limit ? Number(args.limit) : null;
    // --- UPDATED ---
    const result = await sfClient.query.executeCustomQuery(query, limit);

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

// --- Tool: execute_data_cloud_query_v2 ---
const executeDataCloudQueryV2 = {
  definition: {
    name: 'execute_data_cloud_query_v2',
    description: `Executes an asynchronous, large-volume SQL query against Data Cloud (Query API V2). Use this for any query that may return a large result set (e.g., over 10k rows) or for full table exports.
This tool submits the query and returns the *first batch* of results along with a 'nextBatchId'. If a 'nextBatchId' is present in the response, you MUST use the 'get_query_v2_next_batch' tool to retrieve the remaining data.`,
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The SQL query to execute in ANSI SQL standard format',
        },
      },
      required: ['query'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || typeof args !== 'object' || !('query' in args)) {
      throw new Error('query is required');
    }
    const query = String(args.query);
    // --- UPDATED ---
    const result = await sfClient.query.queryDataCloudV2(query);

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

// --- Tool: get_query_v2_next_batch ---
const getQueryV2NextBatch = {
  definition: {
    name: 'get_query_v2_next_batch',
    description: `Retrieves the next batch of results from a large-volume query.
Use this tool *only* after you have called 'execute_data_cloud_query_v2' and received a 'nextBatchId' in the response. Continue calling this tool with the new 'nextBatchId' from each response until the 'nextBatchId' is null or 'done' is true.`,
    inputSchema: {
      type: 'object',
      properties: {
        nextBatchId: {
          type: 'string',
          description: 'The batch ID returned from the previous query response',
        },
      },
      required: ['nextBatchId'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || typeof args !== 'object' || !('nextBatchId' in args)) {
      throw new Error('nextBatchId is required');
    }
    const nextBatchId = String(args.nextBatchId);
    // --- UPDATED ---
    const result = await sfClient.query.queryDataCloudV2NextBatch(nextBatchId);

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

// --- Tool: query_calculated_insight ---
const queryCalculatedInsight = {
  definition: {
    name: 'query_calculated_insight',
    description: 'Query a calculated insight with selected SQL dimensions, measures, and optional filters. Calculated insights are pre-configured analytics in Data Cloud.',
    inputSchema: {
      type: 'object',
      properties: {
        ciName: {
          type: 'string',
          description: 'The name of the calculated insight to query',
        },
        dimensions: {
          type: 'string',
          description: 'Optional: Comma-separated list of dimensions to include',
        },
        measures: {
          type: 'string',
          description: 'Optional: Comma-separated list of measures to include',
        },
        filters: {
          type: 'string',
          description: 'Optional: Filter criteria for the query',
        },
      },
      required: ['ciName'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || typeof args !== 'object' || !('ciName' in args)) {
      throw new Error('ciName is required');
    }
    const ciName = String(args.ciName);
    const dimensions = args.dimensions ? String(args.dimensions) : null;
    const measures = args.measures ? String(args.measures) : null;
    const filters = args.filters ? String(args.filters) : null;

    // --- UPDATED ---
    const result = await sfClient.query.queryCalculatedInsight(ciName, dimensions, measures, filters);

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

// --- Tool: get_calculated_insight_metadata ---
const getCalculatedInsightMetadata = {
  definition: {
    name: 'get_calculated_insight_metadata',
    description: 'Get metadata for a specific calculated insight including available dimensions, measures, and configuration details.',
    inputSchema: {
      type: 'object',
      properties: {
        ciName: {
          type: 'string',
          description: 'The name of the calculated insight',
        },
      },
      required: ['ciName'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || typeof args !== 'object' || !('ciName' in args)) {
      throw new Error('ciName is required');
    }
    const ciName = String(args.ciName);
    // --- UPDATED ---
    const result = await sfClient.query.getCalculatedInsightMetadata(ciName);

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

// --- Tool: list_all_calculated_insights ---
const listAllCalculatedInsights = {
  definition: {
    name: 'list_all_calculated_insights',
    description: 'Get metadata for all calculated insights available in Data Cloud. Returns a list of all CIs with their configurations.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  handler: async (args, sfClient) => {
    // --- UPDATED ---
    const result = await sfClient.query.getAllCalculatedInsightsMetadata();
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

// --- Tool: list_all_data_graphs ---
const listAllDataGraphs = {
  definition: {
    name: 'list_all_data_graphs',
    description: 'Get metadata for all data graphs available in Data Cloud. Data graphs define relationships between objects and enable querying related data.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  handler: async (args, sfClient) => {
    // --- UPDATED ---
    const result = await sfClient.query.getAllDataGraphsMetadata();
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

// --- Tool: get_data_graph_metadata ---
const getDataGraphMetadata = {
  definition: {
    name: 'get_data_graph_metadata',
    description: 'Get detailed metadata for a specific data graph including structure, relationships, and available fields.',
    inputSchema: {
      type: 'object',
      properties: {
        entityName: {
          type: 'string',
          description: 'The name of the data graph entity',
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
    const result = await sfClient.query.getDataGraphMetadata(entityName);

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

// --- Tool: query_data_graph_by_record_id ---
const queryDataGraphByRecordId = {
  definition: {
    name: 'query_data_graph_by_record_id',
    description: 'Query data graph data using a specific record ID. Returns the record and all related data defined in the data graph.',
    inputSchema: {
      type: 'object',
      properties: {
        dataGraphName: {
          type: 'string',
          description: 'The name of the data graph',
        },
        dataGraphRecordId: {
          type: 'string',
          description: 'The record ID to query',
        },
      },
      required: ['dataGraphName', 'dataGraphRecordId'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || typeof args !== 'object' || !('dataGraphName' in args) || !('dataGraphRecordId' in args)) {
      throw new Error('dataGraphName and dataGraphRecordId are required');
    }
    const dataGraphName = String(args.dataGraphName);
    const dataGraphRecordId = String(args.dataGraphRecordId);
    // --- UPDATED ---
    const result = await sfClient.query.queryDataGraphByRecordId(dataGraphName, dataGraphRecordId);

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

// --- Tool: query_data_graph_by_lookup_keys ---
const queryDataGraphByLookupKeys = {
  definition: {
    name: 'query_data_graph_by_lookup_keys',
    description: 'Query data graph data using lookup keys (e.g., email, phone). Useful when you don\'t have the record ID but have identifying information.',
    inputSchema: {
      type: 'object',
      properties: {
        dataGraphName: {
          type: 'string',
          description: 'The name of the data graph',
        },
        lookupKeys: {
          type: 'string',
          description: 'JSON string of lookup key-value pairs, e.g., [{"key": "email", "value": "test@example.com"}]',
        },
      },
      required: ['dataGraphName', 'lookupKeys'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || typeof args !== 'object' || !('dataGraphName' in args) || !('lookupKeys' in args)) {
      throw new Error('dataGraphName and lookupKeys are required');
    }
    const dataGraphName = String(args.dataGraphName);
    const lookupKeysStr = String(args.lookupKeys);

    let lookupKeys;
    try {
      lookupKeys = JSON.parse(lookupKeysStr);
    } catch (e) {
      throw new Error('lookupKeys must be a valid JSON string');
    }

    // --- UPDATED ---
    const result = await sfClient.query.queryDataGraphByLookupKeys(dataGraphName, lookupKeys);

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

// --- Tool: query_unified_record_id ---
const queryUnifiedRecordId = {
  definition: {
    name: 'query_unified_record_id',
    description: 'Retrieves all individual records associated with a unified record through Identity Resolution. Query on an Individual ID from one source and get all Individual IDs for that individual from other data sources. This helps understand how records are unified across systems.',
    inputSchema: {
      type: 'object',
      properties: {
        entityName: {
          type: 'string',
          description: 'The entity name (e.g., Individual, Contact)',
        },
        dataSourceId: {
          type: 'string',
          description: 'The data source ID where the record originates',
        },
        dataSourceObjectId: {
          type: 'string',
          description: 'The data source object ID',
        },
        sourceRecordId: {
          type: 'string',
          description: 'The source record ID to lookup',
        },
      },
      required: ['entityName', 'dataSourceId', 'dataSourceObjectId', 'sourceRecordId'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || typeof args !== 'object' ||
        !('entityName' in args) ||
        !('dataSourceId' in args) ||
        !('dataSourceObjectId' in args) ||
        !('sourceRecordId' in args)) {
      throw new Error('entityName, dataSourceId, dataSourceObjectId, and sourceRecordId are required');
    }
    const entityName = String(args.entityName);
    const dataSourceId = String(args.dataSourceId);
    const dataSourceObjectId = String(args.dataSourceObjectId);
    const sourceRecordId = String(args.sourceRecordId);

    // --- UPDATED ---
    const result = await sfClient.query.queryUnifiedRecordId(
      entityName,
      dataSourceId,
      dataSourceObjectId,
      sourceRecordId
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
export const queryTools = [
  executeDataCloudQuery,
  executeDataCloudQueryV2,
  getQueryV2NextBatch,
  queryCalculatedInsight,
  getCalculatedInsightMetadata,
  listAllCalculatedInsights,
  listAllDataGraphs,
  getDataGraphMetadata,
  queryDataGraphByRecordId,
  queryDataGraphByLookupKeys,
  queryUnifiedRecordId,
];