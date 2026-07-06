/**
 * Service class for all Data Cloud Direct API (Profile) operations.
 * This class doesn't know *how* to authenticate, it just knows
 * *what* endpoints to call.
 */
export class ProfileApiService {
  /**
   * @param {import('../salesforce-client.js').SalesforceClient} client
   */
  constructor(client) {
    this.client = client;
    this.apiVersion = client.dataCloudApiVersion;
  }

  // --- All the methods that *were* in SalesforceClient ---

  async getProfileCount() {
    try {
      const query = 'SELECT COUNT(*) as total FROM UnifiedIndividual__dlm';
      // Note: We are now calling the *client's* helper methods
      const result = await this.client.queryDataCloud(query); 
      return result.data?.[0]?.total || 0;
    } catch (error) {
      console.error('Failed to get profile count:', error);
      throw error;
    }
  }

  async getCustomerConsent(customerId) {
    try {
      const query = `
        SELECT
          cpe.ssot__PartyId__c AS IndividualId__c,
          cpe.ssot__EmailAddress__c AS Email,
          cpe.ssot__HasOptedOutOfEmail__c AS HasOptedOutOfEmail,
          cpe.ssot__EmailBounceReasonText__c AS ConsentStatus__c,
          cpe.ssot__LastModifiedDate__c AS LastModifiedDate
        FROM ssot__ContactPointEmail__dlm cpe
        WHERE cpe.ssot__PartyId__c = '${customerId}'
      `;
      const result = await this.client.queryDataCloud(query);
      return result.data?.[0] || null;
    } catch (error) {
      console.error('Failed to get customer consent:', error);
      throw error;
    }
  }

  async getAllProfileMetadata() {
    try {
      const endpoint = `/api/${this.apiVersion}/profile/metadata`;
      return await this.client.makeDataCloudRequest('GET', endpoint);
    } catch (error) {
      console.error('Failed to get all profile metadata:', error);
      throw error;
    }
  }

  async getProfileDmoMetadata(dmoApiName) {
    try {
      const endpoint = `/api/${this.apiVersion}/profile/metadata/${dmoApiName}`;
      return await this.client.makeDataCloudRequest('GET', endpoint);
    } catch (error) {
      console.error(`Failed to get profile DMO metadata for ${dmoApiName}:`, error);
      throw error;
    }
  }

  async queryProfileDmo(dmoApiName, fields = null, limit = null, filters = null) {
    try {
      let endpoint = `/api/${this.apiVersion}/profile/${dmoApiName}`;
      const params = new URLSearchParams();
      if (fields) params.append('fields', fields);
      if (limit) params.append('limit', limit.toString());
      if (filters) params.append('filters', filters);
      const queryString = params.toString();
      if (queryString) endpoint += `?${queryString}`;
      return await this.client.makeDataCloudRequest('GET', endpoint);
    } catch (error) {
      console.error(`Failed to query profile DMO ${dmoApiName}:`, error);
      throw error;
    }
  }

  async queryProfileDmoById(dmoApiName, dmoRecordId, fields = null, limit = null, filters = null) {
    try {
      let endpoint = `/api/${this.apiVersion}/profile/${dmoApiName}/${dmoRecordId}`;
      const params = new URLSearchParams();
      if (fields) params.append('fields', fields);
      if (limit) params.append('limit', limit.toString());
      if (filters) params.append('filters', filters);
      const queryString = params.toString();
      if (queryString) endpoint += `?${queryString}`;
      return await this.client.makeDataCloudRequest('GET', endpoint);
    } catch (error) {
      console.error(`Failed to query profile DMO ${dmoApiName} by ID ${dmoRecordId}:`, error);
      throw error;
    }
  }

  async queryProfileDmoBySearchKey(dmoApiName, searchKey, searchKeyValue, fields = null, limit = null, filters = null) {
    try {
      let endpoint = `/api/${this.apiVersion}/profile/${dmoApiName}/${searchKeyValue}`;
      const params = new URLSearchParams();
      params.append('searchKey', searchKey);
      if (fields) params.append('fields', fields);
      if (limit) params.append('limit', limit.toString());
      if (filters) params.append('filters', filters);
      endpoint += `?${params.toString()}`;
      return await this.client.makeDataCloudRequest('GET', endpoint);
    } catch (error) {
      console.error(`Failed to query profile DMO ${dmoApiName} by search key:`, error);
      throw error;
    }
  }

  async queryProfileParentChildById(dmoParentApiName, dmoParentRecordId, dmoChildApiName, fields = null, limit = null) {
    try {
      let endpoint = `/api/${this.apiVersion}/profile/${dmoParentApiName}/${dmoParentRecordId}/${dmoChildApiName}`;
      const params = new URLSearchParams();
      if (fields) params.append('fields', fields);
      if (limit) params.append('limit', limit.toString());
      const queryString = params.toString();
      if (queryString) endpoint += `?${queryString}`;
      return await this.client.makeDataCloudRequest('GET', endpoint);
    } catch (error) {
      console.error(`Failed to query parent-child relationship:`, error);
      throw error;
    }
  }

  async queryProfileParentChildBySearchKey(dmoParentApiName, searchKey, searchKeyValue, dmoChildApiName, fields = null, limit = null) {
    try {
      let endpoint = `/api/${this.apiVersion}/profile/${dmoParentApiName}/${dmoChildApiName}`;
      const params = new URLSearchParams();
      params.append('searchKey', searchKey);
      params.append('searchKeyValue', searchKeyValue);
      if (fields) params.append('fields', fields);
      if (limit) params.append('limit', limit.toString());
      endpoint += `?${params.toString()}`;
      return await this.client.makeDataCloudRequest('GET', endpoint);
    } catch (error) {
      console.error(`Failed to query parent-child by search key:`, error);
      throw error;
    }
  }

  async queryProfileCalculatedInsights(dmoApiName, dmoRecordId, insightName, batchSize = null, dimensions = null, measures = null, filters = null) {
    try {
      let endpoint = `/api/${this.apiVersion}/profile/${dmoApiName}/${dmoRecordId}/calculated-insights/${insightName}`;
      const params = new URLSearchParams();
      if (batchSize) params.append('batchSize', batchSize.toString());
      if (dimensions) params.append('dimensions', dimensions);
      if (measures) params.append('measures', measures);
      if (filters) params.append('filters', filters);
      const queryString = params.toString();
      if (queryString) endpoint += `?${queryString}`;
      return await this.client.makeDataCloudRequest('GET', endpoint);
    } catch (error) {
      console.error(`Failed to query calculated insights for profile DMO:`, error);
      throw error;
    }
  }
}