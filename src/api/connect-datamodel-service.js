import { URLSearchParams } from 'url';

// Define TTLs (Time-To-Live) for your cached data
const DMO_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours for schemas (they rarely change)
const MAPPINGS_CACHE_TTL = 1 * 60 * 60 * 1000; // 1 hour for mappings (they might change more often)

/**
 * Service class for all Data Cloud Connect API (Data Model) operations.
 * It uses the main client's 'makeConnectApiRequest' helper.
 *
 * This version is UPDATED with caching logic.
 */
export class ConnectDataModelService {
  /**
   * @param {import('../salesforce-client.js').SalesforceClient} client
   */
  constructor(client) {
    this.client = client;
    this.apiVersion = client.connectApiVersion;
  }

  /**
   * Base endpoint for Data Model Objects (DMOs)
   */
  get baseDmoEndpoint() {
    return `/services/data/${this.apiVersion}/ssot/data-model-objects`;
  }

  /**
   * Base endpoint for Data Model Mappings
   */
  get baseMappingEndpoint() {
    return `/services/data/${this.apiVersion}/ssot/data-model-object-mappings`;
  }

  // --- PUBLIC CACHED METHODS ---

  /**
   * [CACHED] Gets a list of Data Model Objects.
   * @param {object} params - Optional query parameters
   * @param {boolean} [forceRefresh=false] - If true, bypasses cache
   */
  async getDataModelObjects(params = {}, forceRefresh = false) {
    // Create a stable cache key based on the parameters
    const cacheKey = `dmo_list:${JSON.stringify(params)}`;
    
    // The "fetcher" function is our original (now private) method
    const fetcherFn = () => this._fetchDataModelObjects(params);

    return this.client.cache.getOrSet(
      cacheKey,
      DMO_CACHE_TTL,
      fetcherFn,
      forceRefresh
    );
  }

  /**
   * [CACHED] Gets details for a single Data Model Object.
   * @param {string} dmoNameOrId - The API name or ID of the DMO
   * @param {boolean} [forceRefresh=false] - If true, bypasses cache
   */
  async getDataModelObjectByName(dmoNameOrId, forceRefresh = false) {
    const cacheKey = `dmo_schema:${dmoNameOrId}`;
    
    const fetcherFn = () => this._fetchDataModelObjectByName(dmoNameOrId);
    
    return this.client.cache.getOrSet(
      cacheKey,
      DMO_CACHE_TTL,
      fetcherFn,
      forceRefresh
    );
  }

  /**
   * [CACHED] Gets a list of DMO/DLO mappings.
   * @param {object} params - Optional query parameters
   * @param {boolean} [forceRefresh=false] - If true, bypasses cache
   */
  async getDataModelObjectMappings(params = {}, forceRefresh = false) {
    const cacheKey = `dmo_mappings:${JSON.stringify(params)}`;
    
    const fetcherFn = () => this._fetchDataModelObjectMappings(params);
    
    return this.client.cache.getOrSet(
      cacheKey,
      MAPPINGS_CACHE_TTL,
      fetcherFn,
      forceRefresh
    );
  }

  // --- PRIVATE FETCHER METHODS ---
  // (These are your original methods, renamed with a '_')

  /**
   * [PRIVATE] Fetches a list of Data Model Objects from the API.
   */
  async _fetchDataModelObjects(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.dataspace) queryParams.append('dataspace', params.dataspace);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);
    if (params.orderby) queryParams.append('orderby', params.orderby);
    
    const endpoint = `${this.baseDmoEndpoint}?${queryParams.toString()}`;
    console.error(`[API CALL] Fetching DMO list for: ${params.dataspace || 'default'}`);
    return this.client.makeConnectApiRequest('GET', endpoint);
  }

  /**
   * [PRIVATE] Fetches details for a single Data Model Object from the API.
   */
  async _fetchDataModelObjectByName(dmoNameOrId) {
    const endpoint = `${this.baseDmoEndpoint}/${dmoNameOrId}`;
    console.error(`[API CALL] Fetching DMO schema for: ${dmoNameOrId}`);
    return this.client.makeConnectApiRequest('GET', endpoint);
  }

  /**
   * [PRIVATE] Fetches a list of DMO/DLO mappings from the API.
   */
  async _fetchDataModelObjectMappings(params = {}) {
    const dmoDeveloperName = params.dmoDeveloperName || params.dmoName;
    const sourceObjectName = params.sourceObjectName;
    const dloDeveloperName = params.dloDeveloperName || params.dloName;
    if (!dmoDeveloperName && !sourceObjectName) {
      throw new Error('At least one of dmoDeveloperName or sourceObjectName is required.');
    }
    const queryParams = new URLSearchParams();
    if (params.dataspace) queryParams.append('dataspace', params.dataspace);
    if (dmoDeveloperName) queryParams.append('dmoDeveloperName', dmoDeveloperName);
    if (sourceObjectName) queryParams.append('sourceObjectName', sourceObjectName);
    if (dloDeveloperName) queryParams.append('dloDeveloperName', dloDeveloperName);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);

    const endpoint = `${this.baseMappingEndpoint}?${queryParams.toString()}`;
    console.error(`[API CALL] Fetching DMO mappings`);
    return this.client.makeConnectApiRequest('GET', endpoint);
  }
}