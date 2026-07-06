// Define a Time-To-Live (TTL) for this data. 24 hours in milliseconds.
const METADATA_CACHE_TTL = 24 * 60 * 60 * 1000;

/**
 * Service class for interacting with the Data Cloud Metadata API.
 * Provides helper methods that the tools expect (getDataCloudSchema, listDataModelObjects, ...).
 */
export class MetadataApiService {
  constructor(salesforceClient) {
    /** @type {import('../salesforce-client.js').SalesforceClient} */
    this.client = salesforceClient;
    this.dataCloudApiVersion = salesforceClient.dataCloudApiVersion;
  }

  // Generic cached fetch helper if callers want a simple "get metadata" by cache key.
  async getMetadata(cacheKey, fetcherFn, forceRefresh = false) {
    return this.client.cache.getOrSet(cacheKey, METADATA_CACHE_TTL, fetcherFn, forceRefresh);
  }

  // Return the full Data Cloud schema (Data Model Objects)
  async getDataCloudSchema(forceRefresh = false) {
    const cacheKey = 'metadata:schema';
    const fetcher = async () => {
      const endpoint = `/api/${this.dataCloudApiVersion}/metadata?entityType=DataModelObject`;
      console.error(`[API CALL] Fetching Data Cloud schema from ${endpoint}`);
      return this.client.makeDataCloudRequest('GET', endpoint);
    };
    return this.getMetadata(cacheKey, fetcher, forceRefresh);
  }

  // Return metadata for a single object/entity by API name
  async getObjectMetadata(entityName, forceRefresh = false) {
    if (!entityName) throw new Error('entityName is required');
    const cacheKey = `metadata:entity:${entityName}`;
    const fetcher = async () => {
      const endpoint = `/api/${this.dataCloudApiVersion}/metadata?entityName=${encodeURIComponent(entityName)}`;
      console.error(`[API CALL] Fetching metadata for entity ${entityName} from ${endpoint}`);
      return this.client.makeDataCloudRequest('GET', endpoint);
    };
    return this.getMetadata(cacheKey, fetcher, forceRefresh);
  }

  // Return metadata filtered by category
  async getMetadataByCategory(category, forceRefresh = false) {
    if (!category) throw new Error('category is required');
    const cacheKey = `metadata:category:${category}`;
    const fetcher = async () => {
      const endpoint = `/api/${this.dataCloudApiVersion}/metadata?entityCategory=${encodeURIComponent(category)}`;
      console.error(`[API CALL] Fetching metadata for category ${category} from ${endpoint}`);
      return this.client.makeDataCloudRequest('GET', endpoint);
    };
    return this.getMetadata(cacheKey, fetcher, forceRefresh);
  }

  // Return a simplified list of Data Model Objects (name/label/category/etc.)
  async listDataModelObjects(forceRefresh = false) {
    try {
      const schema = await this.getDataCloudSchema(forceRefresh);
      const objects = (schema?.data || schema || []).map(obj => ({
        name: obj.name,
        label: obj.label,
        category: obj.category,
        type: obj.type,
        fieldCount: (obj.fields && obj.fields.length) || 0
      }));
      return objects;
    } catch (error) {
      console.error('Failed to list data model objects:', error);
      throw error;
    }
  }

  // Backwards-compatible helper: fetch everything (kept for callers that used it before)
  async _fetchFreshMetadata() {
    const endpoint = `/api/${this.dataCloudApiVersion}/metadata`;
    console.error(`[API CALL] Fetching fresh metadata from endpoint: ${endpoint}`);
    return this.client.makeDataCloudRequest('GET', endpoint);
  }
}