/**
 * Salesforce CMS Content tools for uploading and publishing content
 * to Marketing Cloud content workspaces via the Connect API.
 * Tool names are prefixed with "cms_".
 */

// ─── Channels ──────────────────────────────────────────────────────────────

const getChannels = {
  definition: {
    name: 'cms_get_channels',
    description: `
      Retrieve a list of CMS *delivery channels* in your Salesforce org.
      Delivery channels are publishing destinations (Marketing Messages, Experience Cloud sites, etc.)
      — NOT content workspaces. To list content workspaces, use 'cms_get_spaces' instead.

      Use cases:
      - Find the channelId for "Marketing Messages" or "Marketing Landing Pages".
      - Discover all available channels and their types (UserPermission, Community, etc.).

      Returns: An object with a 'channels' array. Each channel includes:
      - channelId: The ID of the publishing channel.
      - channelName: Human-readable label.
      - channelType: "UserPermission" or "Community".
      - domain / domainName: CDN domain info (may be null).
      - isChannelSearchable, isDomainLocked: Boolean flags.

      Empty array? The endpoint is correct, but the org has no channels visible to your user. Common reasons:
      - Marketing Cloud Growth/Next isn't provisioned or enabled in the org yet.
      - Your user lacks the "View Setup and Configuration" or channel-specific permissions.
      - Channels exist only in Experience Cloud sites you don't have access to.

      Common errors:
      - 403: Insufficient permissions to list channels.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Optional. Page number for pagination (0-based).' },
        pageSize: { type: 'number', description: 'Optional. Number of channels per page (default: 25).' },
      },
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.cmsContent.getChannels(args);
  },
};

// ─── Content Spaces (a.k.a. Workspaces) ────────────────────────────────────

const getSpaces = {
  definition: {
    name: 'cms_get_spaces',
    description: `
      List CMS content spaces in the org (older docs call these "content workspaces").
      A content space is the container that holds content items — its ID
      (starts with "0Zu...") is the value you pass as 'contentSpaceOrFolderId'
      when calling 'cms_upload_content'. Endpoint available in API v64.0+.

      This is the tool to use if you want to find a workspace to upload content into.
      Note: 'cms_get_channels' lists *publishing destinations*, which is a different concept.

      IMPORTANT: Spaces have two types:
      - "Content" — general CMS content (e.g. for Experience Cloud sites).
      - "Marketing" — content used by Marketing Cloud Growth/Next campaigns.
      Check the 'spaceType' field on each returned space to find the right one.

      Returns: An object with a content spaces collection. Each entry includes:
      - id: The 18-char space ID (e.g. "0Zu1Q0000000ZzZSAU").
      - name / label: Human-readable name.
      - spaceType: "Content" or "Marketing".
      - resourceUrl: API URL for this space.

      Empty array? The user may not be assigned to any content space, or the org has none configured yet.
      If you need a Marketing space and none exist, create one with 'cms_create_space'.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        nameFragment: {
          type: 'string',
          description: 'Optional. Filter spaces whose name contains this substring.',
        },
        page: { type: 'number', description: 'Optional. Page number for pagination (0-based).' },
        pageSize: { type: 'number', description: 'Optional. Items per page (1–250, default 25).' },
      },
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.cmsContent.getSpaces(args);
  },
};

const createSpace = {
  definition: {
    name: 'cms_create_space',
    description: `
      Create a new CMS content space (workspace) in the org.
      Endpoint: POST /services/data/{apiVersion}/connect/cms/spaces (available in v64.0+).

      Pick the right 'spaceType' for the use case:
      - "Content" for general CMS content (used by Experience Cloud, etc.).
      - "Marketing" for Marketing Cloud Growth/Next campaign content. If you intend to
        upload content for Marketing Cloud messages, use "Marketing".

      Example body:
      {
        "name": "ShoeStoreWorkspace",
        "description": "To serve shoe store content.",
        "defaultLanguage": "en_US",
        "spaceType": "Content",
        "apiName": "shoe_store_workspace"
      }

      Returns: The newly created space object, including its 18-char 'id' (starts with "0Zu...").

      Common errors:
      - 400: Missing required 'name', or invalid spaceType.
      - 409: A space with this apiName already exists.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Required. Display name of the content space.',
        },
        spaceType: {
          type: 'string',
          enum: ['Content', 'Marketing'],
          description: 'Type of space. Use "Marketing" for Marketing Cloud Growth/Next content; "Content" for general CMS.',
        },
        apiName: {
          type: 'string',
          description: 'Optional. API name of the space. If omitted, Salesforce generates one.',
        },
        defaultLanguage: {
          type: 'string',
          description: 'Optional. Default language code (e.g. "en_US").',
        },
        description: {
          type: 'string',
          description: 'Optional. Description of the space.',
        },
      },
      required: ['name'],
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.cmsContent.createSpace(args);
  },
};

const getSpace = {
  definition: {
    name: 'cms_get_space',
    description: `
      Retrieve details for a single CMS content space by its ID.

      Returns: A single space object with metadata (name, id, resourceUrl, etc.).

      Common errors:
      - 404: Space not found.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        spaceId: {
          type: 'string',
          description: 'Required. The 18-char ID of the content space (e.g. "0Zu1Q0000000ZzZSAU").',
        },
      },
      required: ['spaceId'],
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.cmsContent.getSpace(args.spaceId);
  },
};

const getFolders = {
  definition: {
    name: 'cms_get_folders',
    description: `
      List folders inside a specific content space. Folder IDs (start with "9Pu...") can
      also be used as the target for content uploads via 'contentSpaceOrFolderId'.

      Returns: An object with a folders array. Each entry includes its id, name, and parent space.

      Common errors:
      - 404: Space not found.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        spaceId: {
          type: 'string',
          description: 'Required. The 18-char ID of the parent content space.',
        },
        page: { type: 'number', description: 'Optional. Page number for pagination (0-based).' },
        pageSize: { type: 'number', description: 'Optional. Number of folders per page.' },
      },
      required: ['spaceId'],
    },
  },
  handler: async (args, sfClient) => {
    const { spaceId, ...params } = args;
    return sfClient.cmsContent.getFolders(spaceId, params);
  },
};

// ─── Upload Content ────────────────────────────────────────────────────────

const uploadContent = {
  definition: {
    name: 'cms_upload_content',
    description: `
      Upload a file to a Salesforce CMS content workspace.
      This sends a multipart/form-data request with JSON metadata and the file binary.

      Use this to add images, documents, or other media to your Marketing Cloud content workspace.

      The 'managedContentInputParam' parameter is a JSON string with these fields:
      - contentSpaceOrFolderId (required): The ID of the target content space or folder (e.g. "0Zu...").
      - title (required): Display title for the content item (e.g. "HeaderImage").
      - contentType (required): The CMS content type (e.g. "sfdc_cms__image", "sfdc_cms__document").
      - contentBody (required): A JSON object describing the content body structure.
        For images: { "sfdc_cms:media": { "source": { "type": "file" } } }

      The file must be provided as a base64-encoded string in 'fileContentBase64'.

      Returns: Metadata about the uploaded content item, including:
      - managedContentId: Copy this — you need it to publish the content.
      - contentKey: Unique content key (e.g. "MCWLJRM7HKRFCKFEUFECYZZZJYAU").
      - status: { "status": "Draft" } — content is unpublished until you call cms_publish_content.
      - contentBody.sfdc_cms:media.url: The relative URL for the uploaded media.

      Common errors:
      - 400: Missing required fields in managedContentInputParam.
      - 404: contentSpaceOrFolderId not found.
      - 413: File too large.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        managedContentInputParam: {
          type: 'string',
          description: `Required. JSON string with content metadata. Example:
"{
  \\"contentSpaceOrFolderId\\": \\"0Zu1Q0000000ZzZSAU\\",
  \\"title\\": \\"HeaderImage\\",
  \\"contentType\\": \\"sfdc_cms__image\\",
  \\"contentBody\\": {
    \\"sfdc_cms:media\\": {
      \\"source\\": { \\"type\\": \\"file\\" }
    }
  }
}"`,
        },
        fileContentBase64: {
          type: 'string',
          description: 'Required. The file content encoded as a base64 string.',
        },
        fileName: {
          type: 'string',
          description: 'Required. The filename for the uploaded file (e.g. "hero-banner.png").',
        },
        mimeType: {
          type: 'string',
          description: 'Required. The MIME type of the file (e.g. "image/png", "image/jpeg", "application/pdf").',
        },
      },
      required: ['managedContentInputParam', 'fileContentBase64', 'fileName', 'mimeType'],
    },
  },
  handler: async (args, sfClient) => {
    const managedContentInputParam = JSON.parse(args.managedContentInputParam);
    return sfClient.cmsContent.uploadContent(
      managedContentInputParam,
      args.fileContentBase64,
      args.fileName,
      args.mimeType
    );
  },
};

// ─── Publish Content ───────────────────────────────────────────────────────

const publishContent = {
  definition: {
    name: 'cms_publish_content',
    description: `
      Publish one or more CMS content items so they can be used in Marketing Cloud messages.

      After uploading content with 'cms_upload_content', the items are in "Draft" status.
      Pass the returned 'managedContentId' values in 'contentIds' to publish them in a single deployment.

      Endpoint: POST /services/data/{apiVersion}/connect/cms/contents/publish

      Returns: An object with:
      - deploymentId: The ID of the publish deployment (e.g. "0jk1Q000000xXTgQAM").
      - description: Echo of the description you sent.
      - publishDate: ISO timestamp when the content was published.

      Example response:
      {
        "deploymentId": "0jk1Q000000xXTgQAM",
        "description": "Content for new email campaign",
        "publishDate": "2024-01-22T21:38:53.000Z"
      }

      Common errors:
      - 404: One of the contentIds was not found.
      - 400: Content is already published or in an invalid state.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        contentIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Required. Array of managedContentId values to publish (e.g. ["20Y1Q0000000XXyUAM"]).',
        },
        description: {
          type: 'string',
          description: 'Optional. A description for the publish deployment (e.g. "Content for new email campaign").',
        },
      },
      required: ['contentIds'],
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.cmsContent.publishContent(args.contentIds, args.description);
  },
};

// ─── Export ────────────────────────────────────────────────────────────────

export const cmsContentTools = [
  getChannels,
  getSpaces,
  createSpace,
  getSpace,
  getFolders,
  uploadContent,
  publishContent,
];
