import { URLSearchParams } from 'url';

/**
 * Service class for all Data Cloud Connect API (Segment) operations.
 * It uses the main client's 'makeConnectApiRequest' helper.
 */
export class ConnectSegmentService {
  /**
   * @param {import('../salesforce-client.js').SalesforceClient} client
   */
  constructor(client) {
    this.client = client;
    // Use the Connect API version from the main client
    this.apiVersion = client.connectApiVersion; 
  }

  /**
   * Base endpoint for segments
   */
  get baseEndpoint() {
    return `/services/data/${this.apiVersion}/ssot/segments`;
  }

  /**
   * Gets a list of segments.
   * @param {object} params - Optional query parameters
   * @param {number} params.batchSize
   * @param {string} params.dataspace
   * @param {string} params.filters
   * @param {number} params.offset
   * @param {string} params.orderby
   */
  async getSegments(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.batchSize) queryParams.append('batchSize', params.batchSize);
    if (params.dataspace) queryParams.append('dataspace', params.dataspace);
    if (params.filters) queryParams.append('filters', params.filters);
    if (params.offset) queryParams.append('offset', params.offset);
    if (params.orderby) queryParams.append('orderby', params.orderby);
    
    const endpoint = `${this.baseEndpoint}?${queryParams.toString()}`;
    return this.client.makeConnectApiRequest('GET', endpoint);
  }

  /**
   * Creates a new segment.
   * @param {string} dataspace - Optional dataspace string
   * @param {object} body - The JSON body for the new segment
   */
  async createSegment(dataspace, body) {
    const queryParams = new URLSearchParams();
    if (dataspace) queryParams.append('dataspace', dataspace);
    
    const endpoint = `${this.baseEndpoint}?${queryParams.toString()}`;
    return this.client.makeConnectApiRequest('POST', endpoint, body);
  }

  /**
   * Gets details for a single segment.
   * @param {string} segmentApiNameOrId - The API name or ID of the segment
   */
  async getSegment(segmentApiNameOrId) {
    const endpoint = `${this.baseEndpoint}/${segmentApiNameOrId}`;
    return this.client.makeConnectApiRequest('GET', endpoint);
  }

  /**
   * Updates an existing segment.
   * @param {string} segmentApiName - The API name of the segment to update
   * @param {object} body - The JSON body containing fields to update
   */
  async updateSegment(segmentApiName, body) {
    const endpoint = `${this.baseEndpoint}/${segmentApiName}`;
    // Using PATCH for partial updates, which is standard for Salesforce REST APIs
    return this.client.makeConnectApiRequest('PATCH', endpoint, body);
  }

  /**
   * Counts the members of a segment.
   * @param {string} segmentApiName - The API name of the segment
   */
  async countSegment(segmentApiName) {
    const endpoint = `${this.baseEndpoint}/${segmentApiName}/actions/count`;
    // Assuming GET for a count action, could be POST if it's async
    return this.client.makeConnectApiRequest('POST', endpoint);
  }

  /**
   * Gets the members of a segment.
   * @param {string} segmentApiName - The API name of the segment
   * @param {object} params - Optional query parameters
   * @param {string} params.fields
   * @param {string} params.filters
   * @param {number} params.limit
   * @param {number} params.offset
   * @param {string} params.orderBy
   */
  async getSegmentMembers(segmentApiName, params = {}) {
    const queryParams = new URLSearchParams();
    // Note: 'fields' can be appended multiple times, but SDK/AI might pass as comma-separated.
    // Assuming 'fields' is a single string for simplicity.
    if (params.fields) queryParams.append('fields', params.fields);
    if (params.filters) queryParams.append('filters', params.filters);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);
    if (params.orderBy) queryParams.append('orderBy', params.orderBy);

    const endpoint = `${this.baseEndpoint}/${segmentApiName}/members?${queryParams.toString()}`;
    return this.client.makeConnectApiRequest('GET', endpoint);
  }

  /**
   * Publishes a segment.
   * @param {string} segmentId - The ID of the segment to publish
   * @param {object} body - Optional body for the publish action
   */
  async publishSegment(segmentId, body = null) {
    const endpoint = `${this.baseEndpoint}/${segmentId}/actions/publish`;
    // Actions are typically POST requests
    return this.client.makeConnectApiRequest('POST', endpoint, body);
  }
}