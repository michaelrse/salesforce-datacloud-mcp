/**
 * All tool modules related to the Data Cloud Connect API (Connections).
 * Tool names are prefixed with 'connect_'.
 */

// --- Tool: connect_get_connection_collection ---
const getConnectionCollection = {
  definition: {
    name: 'connect_get_connection_collection',
    description: `Get a list of Data Cloud connections. Can be filtered and paginated.

Use cases:
- List all Salesforce connectors to check connection status
- Find specific connections by name or label
- Audit available data sources

Common patterns:
- To list all SFDC connections: connectorType=SalesforceDotCom
- Available connectorType values: SalesforceDotCom, Sftp, AzureBlob, Gcs, IngestApi, StreamingApp, AwsRdsPostgres, Databricks, Snowflake, GoogleBigQuery
- To filter by label: label=MyConnectionLabel
- To find a specific connection: devName=MyConnection

Returns: Object containing connections array with fields: id (string), label (string), connectionStatus (Connected or Disconnected), connectorType (string), dataSource (string), plus totalSize (number) and currentPageUrl (string)

Common errors:
- 400: Missing required connectorType parameter
- 404: Connection not found
- 403: Insufficient permissions to view connections`,
    inputSchema: {
      type: 'object',
      properties: {
        connectorType: { type: 'string', description: `Filter by connector type. Valid values: SalesforceDotCom, Sftp, AzureBlob, Gcs, IngestApi, StreamingApp, AwsRdsPostgres, Databricks, Snowflake, GoogleBigQuery`},
        devName: { type: 'string', description: 'Optional. Filter by developer name.' },
        label: { type: 'string', description: 'Optional. Filter by label.' },
        limit: { type: 'number', description: 'Optional. Number of results to return.' },
        offset: { type: 'number', description: 'Optional. Offset for pagination.' },
        orderBy: { type: 'string', description: 'Optional. Field to order by.' },
      },
      required: ['connectorType'],
    },
  },
  handler: async (args, sfClient) => {
    const result = await sfClient.connectConnection.getConnectionCollection(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
};

// --- Tool: connect_get_connection ---
const getConnection = {
  definition: {
    name: 'connect_get_connection',
    description: `Get the details for a single Data Cloud connection by its ID.

Use cases:
- Check the status (Connected/Disconnected) of a specific connection
- Get detailed configuration metadata for a single connector
- Verify the connectorType and dataSource of a known connection ID

Common patterns:
- Call this after using 'connect_get_connection_collection' to get a specific ID.
- Example: connectionId = "0csxxxxxxxxxxxx"

Returns: A single connection object with fields: id (string), label (string), devName (string), connectionStatus (string), connectorType (string), dataSource (string), and other configuration details.

Common errors:
- 404: Connection not found (invalid connectionId)
- 403: Insufficient permissions to view this connection`,
    inputSchema: {
      type: 'object',
      properties: {
        connectionId: { type: 'string', description: 'The ID of the connection. Example: "0csxxxxxxxxxxxx"' },
      },
      required: ['connectionId'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || !args.connectionId) {
      throw new Error('connectionId is required');
    }
    const result = await sfClient.connectConnection.getConnection(args.connectionId);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
};

// --- Tool: connect_post_connection_field_collection ---
const postConnectionFieldCollection = {
  definition: {
    name: 'connect_post_connection_field_collection',
    description: `Post to a connection's object resource to retrieve its fields. This "discovers" the schema for a specific source object.

Use cases:
- Discover the fields and data types for a specific source object (e.g., "Account" table)
- Validate the schema of a data source before creating a data stream
- Get a list of available fields for data mapping

Common patterns:
- connectionId = "0csxxxxxxxxxxxx"
- resourceName = "Account" (for Salesforce source)
- resourceName = "my_custom_table_name" (for other sources)
- The 'body' parameter is typically not required but can be used for advanced connectors that support filtering fields.

Returns: An object, usually with a 'fields' array, containing field definitions (e.g., name, label, dataType, isNullable, isPrimary).

Common errors:
- 404: Connection ID or resourceName not found
- 400: The connection type does not support field discovery, or the resourceName is invalid.`,
    inputSchema: {
      type: 'object',
      properties: {
        connectionId: { type: 'string', description: 'The ID of the connection.' },
        resourceName: { type: 'string', description: 'The API name of the object/resource (e.g., "Account", "my_table").' },
        body: { type: 'string', description: 'Optional. A JSON string for the request body, for advanced filtering.' },
      },
      required: ['connectionId', 'resourceName'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || !args.connectionId || !args.resourceName) {
      throw new Error('connectionId and resourceName are required');
    }
    let requestBody = null;
    if (args.body) {
      try {
        requestBody = JSON.parse(args.body);
      } catch (e) {
        throw new Error('body, if provided, must be a valid JSON string.');
      }
    }
    const result = await sfClient.connectConnection.postConnectionFieldCollection(args.connectionId, args.resourceName, requestBody);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
};

// --- Tool: connect_get_connection_preview ---
const getConnectionPreview = {
  definition: {
    name: 'connect_get_connection_preview',
    description: `Get a data preview (sample rows) from a specific object within a connection.

Use cases:
- Validate that a connection is working and can fetch data
- Inspect sample data from a source object to understand its content and format
- Confirm data types and values before mapping them in a data stream

Common patterns:
- connectionId = "0csxxxxxxxxxxxx"
- resourceName = "Opportunity"

Returns: An object containing a 'schema' (list of columns) and 'data' (array of sample rows).

Common errors:
- 404: Connection ID or resourceName not found
- 400: The source object is empty or the connector does not support data preview.
- 500: Timeout or error from the remote data source.`,
    inputSchema: {
      type: 'object',
      properties: {
        connectionId: { type: 'string', description: 'The ID of the connection.' },
        resourceName: { type: 'string', description: 'The API name of the object/resource to preview.' },
      },
      required: ['connectionId', 'resourceName'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || !args.connectionId || !args.resourceName) {
      throw new Error('connectionId and resourceName are required');
    }
    const result = await sfClient.connectConnection.getConnectionPreview(args.connectionId, args.resourceName);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
};

// --- Tool: connect_get_connection_endpoints ---
const getConnectionEndpoints = {
  definition: {
    name: 'connect_get_connection_endpoints',
    description: `Get the API endpoints (relative URLs) related to a specific connection.

Use cases:
- Advanced debugging to see the specific API paths for a connection
- Discovering related resources like 'schema', 'preview', 'fields' for a connection

Common patterns:
- connectionId = "0csxxxxxxxxxxxx"

Returns: An object mapping resource names to their relative API URLs.
Example: { "self": "/api/v1/connections/0cs...", "schema": "/api/v1/connections/0cs.../schema", ... }

Common errors:
- 404: Connection not found (invalid connectionId)`,
    inputSchema: {
      type: 'object',
      properties: {
        connectionId: { type: 'string', description: 'The ID of the connection.' },
      },
      required: ['connectionId'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || !args.connectionId) {
      throw new Error('connectionId is required');
    }
    const result = await sfClient.connectConnection.getConnectionEndpoints(args.connectionId);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
};

// --- Tool: connect_get_connection_schema ---
const getConnectionSchema = {
  definition: {
    name: 'connect_get_connection_schema',
    description: `Get the full schema definition for a specific connection. This lists *all* available objects from the source.

Use cases:
- Get a complete list of all tables/objects available in the data source
- Audit the full schema of a connection
- Differentiate from 'sitemap', which lists *selected* objects, while this lists all *available* objects.

Common patterns:
- connectionId = "0csxxxxxxxxxxxx"

Returns: A complex JSON object representing the entire data source schema, typically listing all objects/tables and their properties.

Common errors:
- 404: Connection not found (invalid connectionId)
- 400: Connector does not support full schema retrieval.`,
    inputSchema: {
      type: 'object',
      properties: {
        connectionId: { type: 'string', description: 'The ID of the connection.' },
      },
      required: ['connectionId'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || !args.connectionId) {
      throw new Error('connectionId is required');
    }
    const result = await sfClient.connectConnection.getConnectionSchema(args.connectionId);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
};

// --- Tool: connect_put_connection_schema ---
const putConnectionSchema = {
  definition: {
    name: 'connect_put_connection_schema',
    description: `Update (overwrite) the schema definition for a specific connection. This is an advanced operation.

Use cases:
- Manually override the source schema when Data Cloud's discovery is incorrect
- Define a schema for connection types that do not support automatic discovery

Common patterns:
- connectionId = "0csxxxxxxxxxxxx"
- body = '{"objects": [{"name": "MyObject", "fields": [...]}]}'
- The 'body' MUST be a complete, valid schema definition JSON string.

Returns: A status message or the updated schema object.

Common errors:
- 400: Invalid JSON in 'body', or the schema definition is logically invalid.
- 404: Connection not found (invalid connectionId)`,
    inputSchema: {
      type: 'object',
      properties: {
        connectionId: { type: 'string', description: 'The ID of the connection.' },
        body: { type: 'string', description: 'A required JSON string representing the new schema.' },
      },
      required: ['connectionId', 'body'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || !args.connectionId || !args.body) {
      throw new Error('connectionId and body are required');
    }
    let schemaBody;
    try {
      schemaBody = JSON.parse(args.body);
    } catch (e) {
      throw new Error('body must be a valid JSON string.');
    }
    const result = await sfClient.connectConnection.putConnectionSchema(args.connectionId, schemaBody);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
};

// --- Tool: connect_get_connection_sitemap ---
const getConnectionSiteMap = {
  definition: {
    name: 'connect_get_connection_sitemap',
    description: `Get the sitemap for a specific connection. The sitemap lists the objects that are *selected* for ingestion.

Use cases:
- See which objects (e.g., tables) are currently configured to be ingested from a connection
- Differentiate from 'schema', which lists all *available* objects.

Common patterns:
- connectionId = "0csxxxxxxxxxxxx"

Returns: A JSON object listing the selected objects, e.g., '{"objects": ["Account", "Contact", "Lead"]}'.

Common errors:
- 404: Connection not found (invalid connectionId)`,
    inputSchema: {
      type: 'object',
      properties: {
        connectionId: { type: 'string', description: 'The ID of the connection.' },
      },
      required: ['connectionId'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || !args.connectionId) {
      throw new Error('connectionId is required');
    }
    const result = await sfClient.connectConnection.getConnectionSiteMap(args.connectionId);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
};

// --- Tool: connect_put_connection_sitemap ---
const putConnectionSiteMap = {
  definition: {
    name: 'connect_put_connection_sitemap',
    description: `Update (overwrite) the sitemap for a specific connection. This changes which objects are *selected* for ingestion.

Use cases:
- Programmatically add or remove source objects from a connection
- Automate the setup of a new connection by defining which objects to ingest

Common patterns:
- connectionId = "0csxxxxxxxxxxxx"
- body = '{"objects": ["Account", "Contact", "Opportunity"]}'
- This body would set the connection to ingest *only* Account, Contact, and Opportunity.

Returns: A status message or the updated sitemap object.

Common errors:
- 400: Invalid JSON in 'body', or trying to add an object that doesn't exist in the source schema.
- 404: Connection not found (invalid connectionId)`,
    inputSchema: {
      type: 'object',
      properties: {
        connectionId: { type: 'string', description: 'The ID of the connection.' },
        body: { type: 'string', description: 'A required JSON string representing the new sitemap, usually: \'{"objects": ["Obj1", "Obj2"]}\'.' },
      },
      required: ['connectionId', 'body'],
    },
  },
  handler: async (args, sfClient) => {
    if (!args || !args.connectionId || !args.body) {
      throw new Error('connectionId and body are required');
    }
    // Note: This assumes a JSON body. If the API takes text/xml,
    // the helper 'makeConnectApiRequest' would need to be modified
    // to handle different 'Content-Type' headers.
    let sitemapBody;
    try {
      sitemapBody = JSON.parse(args.body);
    } catch (e) {
      throw new Error('body must be a valid JSON string.');
    }
    const result = await sfClient.connectConnection.putConnectionSiteMap(args.connectionId, sitemapBody);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
};

// --- Export all tools in an array ---
export const connectConnectionTools = [
  getConnectionCollection,
  getConnection,
  postConnectionFieldCollection,
  getConnectionPreview,
  getConnectionEndpoints,
  getConnectionSchema,
  putConnectionSchema,
  getConnectionSiteMap,
  putConnectionSiteMap,
];