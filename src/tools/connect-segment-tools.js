/**
 * Data Cloud Connect API tools for working with Segments.
 * Tool names are prefixed with "connect_" to avoid naming conflicts.
 */

// --- Tool: connect_get_segments ---
const getSegments = {
  definition: {
    name: 'connect_get_segments',
    description: `
      Retrieve a list of existing Data Cloud segments (audiences).
      Use this tool when you want to **list, search, or explore available segments**.
      Supports filtering, sorting, and pagination.

      Use cases:
      - List all segments to find one by its 'displayName'.
      - Find all segments in an 'Active' status.
      - Check which segments are segmenting on the 'ssot__Individual__dlm' object.
      - Find the segment API name or ID for use in other tools.

      Common patterns:
      - To find active segments: {"filters": "status='Active'"},
      - To find a segment by name: {"filters": "displayName='High Value Customers'"},
      - To sort by most recent: {"orderby": "createdDate DESC"},

      Returns: An object with a 'segments' array. Each entry includes:
      - apiName / developerName / displayName: Identifiers for the segment.
      - segmentStatus: "ACTIVE", "DRAFT", or "INACTIVE".
      - segmentType: "Dynamic", "Dbt", "Lookalike", etc.
      - segmentOnApiName: The DMO this segment targets (e.g., "UnifiedIndividual__dlm").
      - includeCriteria: Serialized JSON string of the filter rules (only for Dynamic segments).
      - publishStatus: Last publish result ("SUCCESS", "FAILED", etc.).
      - marketSegmentId: 18-char Salesforce record ID — needed for publish and delete operations.
      - segmentMembershipDmo.latestTable: The DMO holding the current member set.

      Common errors:
      - 400: Invalid 'filters' or 'orderby' syntax.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        batchSize: { type: 'number', description: 'Optional. Number of results per page. Default is 20, Max is 200.' },
        dataspace: { type: 'string', description: 'Optional. Dataspace name to query segments within. Defaults to "default".' },
        filters: { type: 'string', description: 'Optional. SOQL-like filter string. Supports fields: status, displayName, developerName, segmentOnApiName, segmentType, createdDate.' },
        offset: { type: 'number', description: 'Optional. Offset for pagination (default: 0).' },
        orderby: { type: 'string', description: 'Optional. Field to order results by. Example: "createdDate DESC".' },
      },
    },
  },
  handler: async (args, sfClient) => {
    const result = await sfClient.connectSegment.getSegments(args);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
};

// --- Tool: connect_create_segment ---
const createSegment = {
  definition: {
    name: 'connect_create_segment',
    description: `
      Create a new Data Cloud segment.
      Use this tool to define and save a new audience based on filter criteria.

      The 'body' parameter is a **JSON string** that defines the entire segment.

      REQUIRED fields inside 'body':
      - **developerName**: Unique API name (e.g., "High_Value_Customers"). Cannot be changed after creation.
      - **displayName**: User-facing label (e.g., "High Value Customers").
      - **description**: Short description of the segment.
      - **segmentOnApiName**: DMO to segment on (e.g., "UnifiedIndividual__dlm").
      - **segmentType**: One of "Dynamic", "Dbt", "EinsteinGptSegmentsUI", "Lookalike", "Realtimez", "Waterfall".
        - Use "Dynamic" for standard filter-based segments (most common).
        - Use "Dbt" for SQL-based segments.
        NOTE: "UI" is a legacy read-only type — it cannot be used when creating segments via API.
        After creation, segmentType cannot be changed.

      FILTER CRITERIA — for "Dynamic" segments:
      - Use **includeCriteria**: a serialized JSON **string** (not a nested object) defining the filter rules.
      - The criteria object uses typed comparison nodes: BooleanComparison, TextComparison, NumberComparison, DateComparison, LogicalComparison (for AND/OR).

      Example 'body' for a Dynamic filter-based segment (Loyalty Members):
      {
        "developerName": "High_Value_Loyalty_Members",
        "displayName": "High Value Loyalty Members",
        "description": "Unified individuals who are active loyalty members",
        "segmentOnApiName": "UnifiedIndividual__dlm",
        "segmentType": "Dynamic",
        "lookbackPeriod": "P90D",
        "includeCriteria": "{\\"type\\":\\"BooleanComparison\\",\\"path\\":null,\\"joinPath\\":null,\\"subject\\":{\\"objectApiName\\":\\"UnifiedIndividual__dlm\\",\\"fieldApiName\\":\\"Loyalty_Member__c\\"},\\"selfReference\\":false,\\"operator\\":\\"equal\\",\\"subjectFieldDataType\\":\\"BOOLEAN\\",\\"subjectFieldBusinessType\\":\\"BOOLEAN\\",\\"subjectFieldSourceType\\":\\"DIRECT\\",\\"value\\":true}"
      }

      Example 'body' for a Dbt SQL-based segment:
      {
        "developerName": "High_Engagement_Score",
        "displayName": "High Engagement Score",
        "description": "Individuals with engagement score above 50",
        "segmentOnApiName": "UnifiedIndividual__dlm",
        "segmentType": "Dbt",
        "includeDbt": {
          "models": [
            {
              "name": "m1",
              "sql": "SELECT UnifiedIndividual__dlm.ssot__Id__c FROM UnifiedIndividual__dlm WHERE UnifiedIndividual__dlm.Engagement_Score__c > 50"
            }
          ]
        }
      }

      Optional fields: lookbackPeriod (e.g. "P90D"), publishSchedule ("NoRefresh"|"One"|"Two"|"Four"|"Six"|"Twelve"|"TwentyFour"), publishScheduleStartDateTime, publishScheduleEndDate, dataspace.

      Returns: The newly created segment object, including its marketSegmentId and segmentStatus.

      Common errors:
      - 400: Missing required fields (developerName, displayName, description, segmentOnApiName, segmentType).
      - 400: Invalid segmentType (e.g. using "UI" — use "Dynamic" instead).
      - 400: includeCriteria passed as a JSON object instead of a serialized JSON string.
      - 409: A segment with this 'developerName' already exists.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        dataspace: { type: 'string', description: 'Optional. The dataspace to create the segment in. Defaults to "default".' },
        body: { 
          type: 'string', 
          description: 'A required, valid JSON string defining the new segment. See tool description for example.'
        },
      },
      required: ['body'],
    },
  },
  handler: async (args, sfClient) => {
    const segmentBody = JSON.parse(args.body);
    const result = await sfClient.connectSegment.createSegment(args.dataspace, segmentBody);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
};

// --- Tool: connect_get_segment ---
const getSegment = {
  definition: {
    name: 'connect_get_segment',
    description: `
      Retrieve the full details for a single Data Cloud segment by its API name or 18-character ID.
      Use this when you need the complete configuration or status of one specific segment.

      Use cases:
      - Resolve a segment's 18-character marketSegmentId when you only have its API name (needed for publish/delete).
      - Check segmentStatus ("ACTIVE", "DRAFT") or publishStatus ("SUCCESS", "FAILED").
      - Read the includeCriteria filter rules of an existing segment.

      Returns: A segments array containing one entry with the full segment object, including:
      - apiName, developerName, displayName
      - segmentStatus, publishStatus, lastSegmentMemberCount
      - includeCriteria: A JSON string encoding the filter rules (use JSON.parse to inspect it).
      - marketSegmentId: The 18-char ID needed by connect_publish_segment.
      - segmentMembershipDmo.latestTable / historyTable: DMO names holding member data.

      Common errors:
      - 404: Segment not found.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        segmentApiNameOrId: { type: 'string', description: 'API name (e.g., "High_Value_Customers") or 18-character ID (e.g., "0PS...") of the segment.' },
      },
      required: ['segmentApiNameOrId'],
    },
  },
  handler: async (args, sfClient) => {
    const result = await sfClient.connectSegment.getSegment(args.segmentApiNameOrId);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
};

// --- Tool: connect_update_segment ---
const updateSegment = {
  definition: {
    name: 'connect_update_segment',
    description: `
      Update an existing Data Cloud segment using its API name.
      This is a PATCH operation — only include fields you want to change.

      NOT supported for PATCH (read-only after creation):
      - developerName, segmentType, additionalMetadata

      Updatable fields: displayName, description, includeCriteria, excludeCriteria,
      lookbackPeriod, publishSchedule, publishScheduleStartDateTime, publishScheduleEndDate.

      IMPORTANT: When updating 'includeCriteria', pass it as a serialized JSON **string**,
      not as a nested object. Same rule as for create.

      Example 'body' to update the description:
      {
        "description": "Updated segment description."
      }

      Example 'body' to update the filter criteria:
      {
        "includeCriteria": "{\\"type\\":\\"NumberComparison\\",\\"subject\\":{\\"objectApiName\\":\\"UnifiedIndividual__dlm\\",\\"fieldApiName\\":\\"Churn_Score__c\\"},\\"operator\\":\\"greater than\\",\\"value\\":70}"
      }

      Returns: The updated segment object.

      Common errors:
      - 400: Attempting to update a read-only field (developerName, segmentType).
      - 400: includeCriteria passed as a JSON object instead of a serialized JSON string.
      - 404: Segment with that 'segmentApiName' not found.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        segmentApiName: { type: 'string', description: 'API name of the segment to update (e.g., "High_Value_Customers").' },
        body: { type: 'string', description: 'Required. JSON string of fields to update. Example: "{\\"displayName\\": \\"New Label\\"}"' },
      },
      required: ['segmentApiName', 'body'],
    },
  },
  handler: async (args, sfClient) => {
    const segmentBody = JSON.parse(args.body);
    const result = await sfClient.connectSegment.updateSegment(args.segmentApiName, segmentBody);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
};

// --- Tool: connect_count_segment ---
const countSegment = {
  definition: {
    name: 'connect_count_segment',
    description: `
      Triggers an asynchronous member-count job for a segment. Does not return the count directly —
      it initiates the recount and returns a job status. Check lastSegmentMemberCount via
      connect_get_segment after the job completes to see the updated number.

      Returns: An object with segmentId and success flag.
      Example: { "segmentId": "1sgWz0000005Tm9IAE", "success": true, "errors": [] }

      Common errors:
      - 404: Segment not found.
      - 400: Segment is in Draft status and has never been published — count is not available.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        segmentApiName: { type: 'string', description: 'API name of the segment to trigger a recount for (e.g., "High_Value_Customers").' },
      },
      required: ['segmentApiName'],
    },
  },
  handler: async (args, sfClient) => {
    const result = await sfClient.connectSegment.countSegment(args.segmentApiName);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
};

// --- Tool: connect_get_segment_members ---
const getSegmentMembers = {
  definition: {
    name: 'connect_get_segment_members',
    description: `
      Retrieve members (records) belonging to a specific Data Cloud segment.
      Use this tool when you want to **see the data of who belongs to an audience**.
      Supports field selection, filtering, and pagination.

      Use cases:
      - Get the first 100 Individual IDs in a segment.
      - Get the email and first name for members of a segment, ordered by last name.
      - Spot-check the results of a segment to ensure criteria are working.

      Common patterns:
      - To get specific fields: \`{"segmentApiName": "...", "fields": "ssot__Individual__dlm.ssot__Email__c, ssot__Individual__dlm.ssot__FirstName__c"}\`
      - To paginate: \`{"segmentApiName": "...", "limit": 100, "offset": 200}\`

      Returns: An object with a 'data' array (the members) and 'metadata' (field info, totalSize) like this sample:
      {
    "data": [
        {
            "deltaType": "new",
            "id": "8f823d92cd0aecd8debcaa79d15feb91",
            "snapshotType": "F",
            "timestamp": "2025-06-11T13:07:08.148Z",
            "versionStamp": "2025-06-10T21:09:11.837Z"
        },
        {
            "deltaType": "new",
            "id": "c5a5aa65e7fc28da90a7738c2213bd61",
            "snapshotType": "F",
            "timestamp": "2025-06-11T13:07:08.148Z",
            "versionStamp": "2025-06-10T21:09:11.837Z"
        }
    ],
    "endTime": "2025-10-26T08:58:29.000Z",
    "filter": "Delta_Type__c in ( new , existing )",
    "limit": 100,
    "offSet": 0,
    "orderBy": "Id__c asc",
    "rowCount": 2,
    "startTime": "2025-10-26T08:58:29.000Z",
    "totalCount": 2
}

      Common errors:
      - 404: Segment not found.
      - 400: Invalid field name in 'fields' or 'filters'.
      - 400: Segment has no published data to retrieve.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        segmentApiName: { type: 'string', description: 'API name of the segment to retrieve members from.' },
        fields: { type: 'string', description: 'Optional. Comma-separated list of fields to include in results. Must be fully qualified (e.g., "ssot__Individual__dlm.ssot__Id__c").' },
        filters: { type: 'string', description: 'Optional. SOQL-like condition to filter members. Fields must be fully qualified.' },
        limit: { type: 'number', description: 'Optional. Max number of records to return (default: 100).' },
        offset: { type: 'number', description: 'Optional. Offset for pagination (default: 0).' },
        orderBy: { type: 'string', description: 'Optional. Field to order results by. Must be fully qualified. Example: "ssot__Individual__dlm.ssot__LastName__c ASC".' },
      },
      required: ['segmentApiName'],
    },
  },
  handler: async (args, sfClient) => {
    const { segmentApiName, ...params } = args;
    const result = await sfClient.connectSegment.getSegmentMembers(segmentApiName, params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
};

// --- Tool: connect_publish_segment ---
const publishSegment = {
  definition: {
    name: 'connect_publish_segment',
    description: `
      Triggers a job to publish (or refresh) a segment's population.
      This **asynchronous operation** calculates the segment members and makes them available for activation.
      Use this tool when a segment's definition is ready and you want to calculate its audience.

      Note: This tool requires the 18-character **Segment ID**, not its API name.
      (You can get the ID using 'connect_get_segment' with the API name).

      Example 'body':
      - For a full refresh: \`{"publishMode": "Full"}\`
      - For an incremental refresh: \`{"publishMode": "Incremental"}\`

      Returns: A status object, often with the publish job ID.

      Common errors:
      - 404: Segment ID not found.
      - 400: Segment is not in 'Active' status and cannot be published.
      - 409: Segment is already being published (operation in progress).
    `,
    inputSchema: {
      type: 'object',
      properties: {
        segmentId: { type: 'string', description: 'The 18-character ID of the segment to publish (e.g., "0PS...").' },
        body: { type: 'string', description: 'Optional. JSON string for publish parameters. Example: "{\\"publishMode\\": \\"Full\\"}".' },
      },
      required: ['segmentId'],
    },
  },
  handler: async (args, sfClient) => {
    let publishBody = args.body ? JSON.parse(args.body) : null;
    const result = await sfClient.connectSegment.publishSegment(args.segmentId, publishBody);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
};

// --- Export all tools ---
export const connectSegmentTools = [
  getSegments,
  createSegment,
  getSegment,
  updateSegment,
  countSegment,
  getSegmentMembers,
  publishSegment,
];