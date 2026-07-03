/**
 * Service class for all Data Cloud Personalization API operations.
 */
export class PersonalizationApiService {
  /**
   * @param {import('../salesforce-client.js').SalesforceClient} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Requests personalization decisions from Data Cloud.
   * @param {object} requestBody - The full request body for the /personalization/decisions endpoint.
   * @returns {Promise<object>} The decision response.
   */
  async getDecisions(requestBody) {
    try {
      const endpoint = '/personalization/decisions';
      // This is a POST request and the entire body is passed through.
      return await this.client.makeDataCloudRequest('POST', endpoint, requestBody);
    } catch (error) {
      console.error('Failed to get personalization decisions:', error);
      throw error;
    }
  }
}