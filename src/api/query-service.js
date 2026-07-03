/**
 * Service class for all Data Cloud Direct API (Query, CI, and Data Graph) operations.
 */
export class QueryApiService {
  /**
   * @param {import('../salesforce-client.js').SalesforceClient} client
   */
  constructor(client) {
    this.client = client;
    this.apiVersion = client.dataCloudApiVersion;
  }

  // --- All the methods that *were* in SalesforceClient ---

  async executeCustomQuery(query, limit = null) {
    // This method just calls the helper on the main client
    return await this.client.queryDataCloud(query, limit);
  }

  async queryDataCloudV2(sql) {
    try {
      const endpoint = `/api/v2/query`;
      return await this.client.makeDataCloudRequest('POST', endpoint, { sql });
    } catch (error) {
      console.error('Data Cloud V2 query failed:', error);
      throw error;
    }
  }

  async queryDataCloudV2NextBatch(nextBatchId) {
    try {
      const endpoint = `/api/v2/query/${nextBatchId}`;
      return await this.client.makeDataCloudRequest('GET', endpoint);
    } catch (error) {
      console.error('Data Cloud V2 next batch query failed:', error);
      throw error;
    }
  }

  async queryCalculatedInsight(ciName, dimensions = null, measures = null, filters = null) {
    try {
      let endpoint = `/api/${this.apiVersion}/insight/calculated-insights/${ciName}`;
      const params = new URLSearchParams();
      if (dimensions) params.append('dimensions', dimensions);
      if (measures) params.append('measures', measures);
      if (filters) params.append('filters', filters);
      const queryString = params.toString();
      if (queryString) endpoint += `?${queryString}`;
      return await this.client.makeDataCloudRequest('GET', endpoint);
    } catch (error) {
      console.error(`Failed to query calculated insight ${ciName}:`, error);
      throw error;
    }
  }

  async getCalculatedInsightMetadata(ciName) {
    try {
      const endpoint = `/api/${this.apiVersion}/insight/metadata/${ciName}`;
      return await this.client.makeDataCloudRequest('GET', endpoint);
    } catch (error) {
      console.error(`Failed to get metadata for calculated insight ${ciName}:`, error);
      throw error;
    }
  }

  async getAllCalculatedInsightsMetadata() {
    try {
      const endpoint = `/api/${this.apiVersion}/insight/metadata`;
      return await this.client.makeDataCloudRequest('GET', endpoint);
    } catch (error) {
      console.error('Failed to get all calculated insights metadata:', error);
      throw error;
    }
  }

  async getAllDataGraphsMetadata() {
    try {
      const endpoint = `/api/${this.apiVersion}/dataGraph/metadata`;
      return await this.client.makeDataCloudRequest('GET', endpoint);
    } catch (error) {
      console.error('Failed to get all data graphs metadata:', error);
      throw error;
    }
  }

  async getDataGraphMetadata(entityName) {
    try {
      const endpoint = `/api/${this.apiVersion}/dataGraph/metadata?entityName=${entityName}`;
      return await this.client.makeDataCloudRequest('GET', endpoint);
    } catch (error) {
      console.error(`Failed to get data graph metadata for ${entityName}:`, error);
      throw error;
    }
  }

  async queryDataGraphByRecordId(dataGraphName, dataGraphRecordId) {
    try {
      const endpoint = `/api/${this.apiVersion}/dataGraph/${dataGraphName}/${dataGraphRecordId}`;
      return await this.client.makeDataCloudRequest('GET', endpoint);
    } catch (error) {
      console.error(`Failed to query data graph ${dataGraphName} with record ID ${dataGraphRecordId}:`, error);
      throw error;
    }
  }

  async queryDataGraphByLookupKeys(dataGraphName, lookupKeys) {
    try {
      const lookupKeysJson = JSON.stringify(lookupKeys);
      const endpoint = `/api/${this.apiVersion}/dataGraph/${dataGraphName}?lookupKeys=${encodeURIComponent(lookupKeysJson)}`;
      return await this.client.makeDataCloudRequest('GET', endpoint);
    } catch (error) {
      console.error(`Failed to query data graph ${dataGraphName} with lookup keys:`, error);
      throw error;
    }
  }

  async queryUnifiedRecordId(entityName, dataSourceId, dataSourceObjectId, sourceRecordId) {
    try {
      const endpoint = `/api/${this.apiVersion}/universalIdLookup/${entityName}/${dataSourceId}/${dataSourceObjectId}/${sourceRecordId}`;
      return await this.client.makeDataCloudRequest('GET', endpoint);
    } catch (error) {
      console.error(`Failed to lookup unified record ID for ${entityName}:`, error);
      throw error;
    }
  }
}