import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

/**
 * Service class for Salesforce CMS Content operations.
 * Covers channels, content upload (multipart/form-data), and publish.
 * Base path: /services/data/{version}/connect/cms/
 */
export class CmsContentService {
  /**
   * @param {import('../salesforce-client.js').SalesforceClient} client
   */
  constructor(client) {
    this.client = client;
    this.apiVersion = client.connectApiVersion;
  }

  get baseEndpoint() {
    return `/services/data/${this.apiVersion}/connect/cms`;
  }

  /**
   * Lists all CMS delivery channels in the org.
   * @param {object} params - Optional pagination params
   */
  async getChannels(params = {}) {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', params.page);
    if (params.pageSize) qs.append('pageSize', params.pageSize);
    const endpoint = `${this.baseEndpoint}/delivery/channels${qs.toString() ? `?${qs}` : ''}`;
    return this.client.makeConnectApiRequest('GET', endpoint);
  }

  /**
   * Lists CMS content spaces (formerly called "content workspaces") in the org.
   * A content space is where content items live — its ID (starts with "0Zu...")
   * is the value you pass as 'contentSpaceOrFolderId' when uploading content.
   * Endpoint available in API v64.0+.
   * @param {object} params - Optional query params
   * @param {string} params.nameFragment - Filter spaces whose name contains this substring
   * @param {number} params.page - Page number (0-based)
   * @param {number} params.pageSize - Items per page (1–250, default 25)
   */
  async getSpaces(params = {}) {
    const qs = new URLSearchParams();
    if (params.nameFragment) qs.append('nameFragment', params.nameFragment);
    if (params.page !== undefined) qs.append('page', params.page);
    if (params.pageSize) qs.append('pageSize', params.pageSize);
    const endpoint = `${this.baseEndpoint}/spaces${qs.toString() ? `?${qs}` : ''}`;
    return this.client.makeConnectApiRequest('GET', endpoint);
  }

  /**
   * Creates a new CMS content space (workspace).
   * Endpoint available in API v64.0+.
   * @param {object} body - The ManagedContentSpaceInputRepresentation
   * @param {string} body.name - Required. Display name of the space.
   * @param {string} body.spaceType - "Content" or "Marketing". For Marketing Cloud content, use "Marketing".
   * @param {string} body.apiName - Optional. API name (defaults to a generated one).
   * @param {string} body.defaultLanguage - Optional. e.g. "en_US".
   * @param {string} body.description - Optional. Description.
   */
  async createSpace(body) {
    const endpoint = `${this.baseEndpoint}/spaces`;
    return this.client.makeConnectApiRequest('POST', endpoint, body);
  }

  /**
   * Gets details for a single content space.
   * @param {string} spaceId - The ID of the content space (e.g. "0Zu1Q0000000ZzZSAU")
   */
  async getSpace(spaceId) {
    const endpoint = `${this.baseEndpoint}/spaces/${spaceId}`;
    return this.client.makeConnectApiRequest('GET', endpoint);
  }

  /**
   * Lists folders inside a content space. Folders also work as a target
   * for content uploads via 'contentSpaceOrFolderId'.
   * @param {string} spaceId - The ID of the parent content space
   * @param {object} params - Optional pagination params
   */
  async getFolders(spaceId, params = {}) {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', params.page);
    if (params.pageSize) qs.append('pageSize', params.pageSize);
    const endpoint = `${this.baseEndpoint}/spaces/${spaceId}/folders${qs.toString() ? `?${qs}` : ''}`;
    return this.client.makeConnectApiRequest('GET', endpoint);
  }

  /**
   * Uploads content to a CMS content workspace using multipart/form-data.
   * @param {object} managedContentInputParam - The JSON metadata part of the upload
   * @param {string} fileContentBase64 - Base64-encoded file content
   * @param {string} fileName - The filename for the file part
   * @param {string} mimeType - MIME type of the file (e.g. "image/png")
   */
  async uploadContent(managedContentInputParam, fileContentBase64, fileName, mimeType) {
    if (!this.client.conn.accessToken || !this.client.conn.instanceUrl) {
      throw new Error('Not authenticated with core Salesforce. Please call authenticate() first.');
    }

    const boundary = `Boundary${Date.now()}`;
    const CRLF = '\r\n';
    const fileBuffer = Buffer.from(fileContentBase64, 'base64');

    // Part 1: JSON metadata
    const part1 = Buffer.from(
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="ManagedContentInputParam"${CRLF}` +
      `Content-Type: application/json; charset=UTF-8${CRLF}${CRLF}` +
      JSON.stringify(managedContentInputParam) +
      CRLF
    );

    // Part 2: file header + file bytes
    const part2Header = Buffer.from(
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="fileData"; filename="${fileName}"${CRLF}` +
      `Content-Type: ${mimeType}${CRLF}${CRLF}`
    );

    const closing = Buffer.from(`${CRLF}--${boundary}--`);

    const body = Buffer.concat([part1, part2Header, fileBuffer, closing]);

    const url = `${this.client.conn.instanceUrl}${this.baseEndpoint}/contents`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Authorization': `Bearer ${this.client.conn.accessToken}`,
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CMS Content Upload Error: ${errorText}`);
      throw new Error(`CMS content upload failed with status ${response.status}`);
    }
    return response.json();
  }

  /**
   * Publishes one or more CMS content items.
   * @param {string[]} contentIds - Array of managedContentId values to publish
   * @param {string} description - Optional description for the publish deployment
   */
  async publishContent(contentIds, description = null) {
    const endpoint = `${this.baseEndpoint}/contents/publish`;
    const body = { contentIds };
    if (description) body.description = description;
    return this.client.makeConnectApiRequest('POST', endpoint, body);
  }
}
