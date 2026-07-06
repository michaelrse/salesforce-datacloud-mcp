import { dataModelResources } from './datamodel-resources.js';

export class DataModelResourceService {
  constructor(client) {
    this.client = client;
    this.resources = dataModelResources;
    
    // Simple in-memory cache with expiry
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.cacheTTL = 60 * 60 * 1000; // 1 hour (schemas don't change often)
  }

  getResourceDefinitions() {
    return this.resources.map(r => r.definition);
  }

  async handleResourceRead(uri) {
    const now = Date.now();
    
    // Check cache
    if (this.cache.has(uri)) {
      const expiry = this.cacheExpiry.get(uri);
      if (now < expiry) {
        console.error(`✅ Cache HIT for resource: ${uri}`);
        return this.cache.get(uri);
      }
    }
    
    // Find handler
    const resource = this.resources.find(r => r.definition.uri === uri);
    if (!resource) {
      throw new Error(`Unknown resource URI: ${uri}`);
    }
    
    // Fetch fresh data
    console.error(`🔄 Cache MISS for resource: ${uri}, fetching...`);
    const result = await resource.handler(this.client);
    
    // Cache it
    this.cache.set(uri, result);
    this.cacheExpiry.set(uri, now + this.cacheTTL);
    
    return result;
  }
  
  // Optional: Method to clear cache
  clearCache(uri = null) {
    if (uri) {
      this.cache.delete(uri);
      this.cacheExpiry.delete(uri);
    } else {
      this.cache.clear();
      this.cacheExpiry.clear();
    }
  }
}