/**
 * Service class for all core Salesforce REST API (Utility) operations.
 * It uses the main client's 'makeConnectApiRequest' helper, as this is an on-core API.
 */
export class CoreUtilityService {
  /**
   * @param {import('../salesforce-client.js').SalesforceClient} client
   */
  constructor(client) {
    this.client = client;
    // We can use the 'connectApiVersion' for this core endpoint
    this.apiVersion = client.connectApiVersion;
  }

  /**
   * Gets information about limits in your org.
   * This is an on-core call and uses the 'makeConnectApiRequest' helper.
   */
  async getOrgLimits() {
    // The endpoint is /services/data/vXX.X/limits
    const endpoint = `/services/data/${this.apiVersion}/limits`;
    return this.client.makeConnectApiRequest('GET', endpoint);
  }
}
