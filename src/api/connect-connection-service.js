import { URLSearchParams } from 'url';

// Define TTLs (Time-To-Live) for your cached data
// We'll use a shorter TTL for connection info than for DMOs, as status can change.
const CONNECTION_CACHE_TTL = 1 * 60 * 60 * 1000; // 1 hour
const CONNECTION_SCHEMA_TTL = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Service class for all Data Cloud Connection operations.
 * It uses the main client's 'makeDataCloudRequest' helper (Direct API).
 *
 * This version is UPDATED with caching and cache-invalidation logic.
 */
export class ConnectConnectionService {
  /**
   * @param {import('../salesforce-client.js').SalesforceClient} client
   */
  constructor(client) {
    this.client = client;
    this.apiVersion = client.dataCloudApiVersion;
  }

  /**
   * Base endpoint for Connections
   */
  get baseConnectionEndpoint() {
    return `/api/${this.apiVersion}/connections`;
  }

  // --- PUBLIC CACHED 'GET' METHODS ---

  /**
   * [CACHED] Get a list of Data Cloud connections.
   * @param {object} params - Optional query parameters
   * @param {boolean} [forceRefresh=false]
   */
  async getConnectionCollection(params = {}, forceRefresh = false) {
    const cacheKey = `connection_collection:${JSON.stringify(params)}`;
    const fetcherFn = () => this._fetchGetConnectionCollection(params);

    return this.client.cache.getOrSet(
      cacheKey,
      CONNECTION_CACHE_TTL,
      fetcherFn,
      forceRefresh
    );
  }

  /**
   * [CACHED] Get the details for a single Data Cloud connection.
   * @param {string} connectionId
   * @param {boolean} [forceRefresh=false]
   */
  async getConnection(connectionId, forceRefresh = false) {
    const cacheKey = `connection:${connectionId}`;
    const fetcherFn = () => this._fetchGetConnection(connectionId);

    return this.client.cache.getOrSet(
      cacheKey,
      CONNECTION_CACHE_TTL,
      fetcherFn,
      forceRefresh
    );
  }

  /**
   * [CACHED] Post to a connection's object resource to retrieve its fields.
   * @param {string} connectionId
   * @param {string} resourceName
   * @param {object} body
   * @param {boolean} [forceRefresh=false]
   */
  async postConnectionFieldCollection(connectionId, resourceName, body = null, forceRefresh = false) {
    const cacheKey = `connection_fields:${connectionId}:${resourceName}:${JSON.stringify(body)}`;
    const fetcherFn = () => this._fetchPostConnectionFieldCollection(connectionId, resourceName, body);

    return this.client.cache.getOrSet(
      cacheKey,
      CONNECTION_SCHEMA_TTL, // Schemas are stable
      fetcherFn,
      forceRefresh
    );
  }

  /**
   * [CACHED] Get the API endpoints related to a specific connection.
   * @param {string} connectionId
   * @param {boolean} [forceRefresh=false]
   */
  async getConnectionEndpoints(connectionId, forceRefresh = false) {
    const cacheKey = `connection_endpoints:${connectionId}`;
    const fetcherFn = () => this._fetchGetConnectionEndpoints(connectionId);

    return this.client.cache.getOrSet(
      cacheKey,
      CONNECTION_SCHEMA_TTL, // Endpoints are very stable
      fetcherFn,
      forceRefresh
    );
  }

  /**
   * [CACHED] Get the full schema definition for a specific connection.
   * @param {string} connectionId
   * @param {boolean} [forceRefresh=false]
   */
  async getConnectionSchema(connectionId, forceRefresh = false) {
    const cacheKey = `connection_schema:${connectionId}`;
    const fetcherFn = () => this._fetchGetConnectionSchema(connectionId);

    return this.client.cache.getOrSet(
      cacheKey,
      CONNECTION_SCHEMA_TTL,
      fetcherFn,
      forceRefresh
    );
  }

  /**
   * [CACHED] Get the sitemap for a specific connection.
   * @param {string} connectionId
   * @param {boolean} [forceRefresh=false]
   */
  async getConnectionSiteMap(connectionId, forceRefresh = false) {
    const cacheKey = `connection_sitemap:${connectionId}`;
    const fetcherFn = () => this._fetchGetConnectionSiteMap(connectionId);

    return this.client.cache.getOrSet(
      cacheKey,
      CONNECTION_CACHE_TTL,
      fetcherFn,
      forceRefresh
    );
  }

  // --- PUBLIC 'LIVE' (NON-CACHED) METHODS ---

  /**
   * [LIVE] Get a data preview from a specific object within a connection.
   * This is NOT cached, as we always want live preview data.
   * @param {string} connectionId
   * @param {string} resourceName
   */
  async getConnectionPreview(connectionId, resourceName) {
    console.log(`[API CALL] Fetching LIVE preview for: ${connectionId}/${resourceName}`);
    const endpoint = `${this.baseConnectionEndpoint}/${connectionId}/${resourceName}/preview`;
    return this.client.makeDataCloudRequest('GET', endpoint);
  }

  // --- PUBLIC 'WRITE' (CACHE-INVALIDATING) METHODS ---

  /**
   * [INVALIDATES CACHE] Update (overwrite) the schema definition.
   * @param {string} connectionId
   * @param {object} schemaBody
   */
  async putConnectionSchema(connectionId, schemaBody) {
    console.log(`[API CALL] Updating schema for: ${connectionId}`);
    const endpoint = `${this.baseConnectionEndpoint}/${connectionId}/schema`;
    
    // 1. Make the API call
    const result = await this.client.makeDataCloudRequest('PUT', endpoint, schemaBody);

    // 2. Invalidate stale caches
    this.client.cache.del(`connection_schema:${connectionId}`);
    this.client.cache.del(`connection:${connectionId}`); // Main connection object might be updated

    return result;
  }

  /**
   * [INVALIDATES CACHE] Update (overwrite) the sitemap.
   * @param {string} connectionId
   * @param {object} sitemapBody
   */
  async putConnectionSiteMap(connectionId, sitemapBody) {
    console.log(`[API CALL] Updating sitemap for: ${connectionId}`);
    const endpoint = `${this.baseConnectionEndpoint}/${connectionId}/sitemap`;

    // 1. Make the API call
    const result = await this.client.makeDataCloudRequest('PUT', endpoint, sitemapBody);

    // 2. Invalidate stale caches
    this.client.cache.del(`connection_sitemap:${connectionId}`);
    this.client.cache.del(`connection:${connectionId}`);

    return result;
  }

  // --- PRIVATE FETCHER METHODS ---
  // (These are the original API call implementations)

  async _fetchGetConnectionCollection(params = {}) {
    const queryParams = new URLSearchParams(params);
    const endpoint = `${this.baseConnectionEndpoint}?${queryParams.toString()}`;
    console.log(`[API CALL] Fetching connection collection`);
    return this.client.makeDataCloudRequest('GET', endpoint);
  }

  async _fetchGetConnection(connectionId) {
    const endpoint = `${this.baseConnectionEndpoint}/${connectionId}`;
    console.log(`[API CALL] Fetching connection details for: ${connectionId}`);
    return this.client.makeDataCloudRequest('GET', endpoint);
  }

  async _fetchPostConnectionFieldCollection(connectionId, resourceName, body) {
    const endpoint = `${this.baseConnectionEndpoint}/${connectionId}/${resourceName}/fields`;
    console.log(`[API CALL] Fetching connection fields for: ${connectionId}/${resourceName}`);
    return this.client.makeDataCloudRequest('POST', endpoint, body);
  }

  async _fetchGetConnectionEndpoints(connectionId) {
    const endpoint = `${this.baseConnectionEndpoint}/${connectionId}/endpoints`;
    console.log(`[API CALL] Fetching connection endpoints for: ${connectionId}`);
    return this.client.makeDataCloudRequest('GET', endpoint);
  }

  async _fetchGetConnectionSchema(connectionId) {
    const endpoint = `${this.baseConnectionEndpoint}/${connectionId}/schema`;
    console.log(`[API CALL] Fetching connection schema for: ${connectionId}`);
    return this.client.makeDataCloudRequest('GET', endpoint);
  }

  async _fetchGetConnectionSiteMap(connectionId) {
    const endpoint = `${this.baseConnectionEndpoint}/${connectionId}/sitemap`;
    console.log(`[API CALL] Fetching connection sitemap for: ${connectionId}`);
    return this.client.makeDataCloudRequest('GET', endpoint);
  }
}