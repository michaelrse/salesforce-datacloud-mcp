import { URLSearchParams } from 'url';

/**
 * Service class for all Data Cloud Connect API (Identity Resolution) operations.
 * It uses the main client's 'makeConnectApiRequest' helper.
 */
export class ConnectIdentityService {
  /**
   * @param {import('../salesforce-client.js').SalesforceClient} client
   */
  constructor(client) {
    this.client = client;
    this.apiVersion = client.connectApiVersion;
  }

  /**
   * Base endpoint for Identity Resolution
   */
  get baseEndpoint() {
    return `/services/data/${this.apiVersion}/ssot/identity-resolutions`;
  }

  /**
   * Gets a list of identity resolution rulesets.
   * @param {object} params - Optional query parameters (e.g., dataspace)
   */
  async getIdentityResolutionRulesets(params = {}) {
    const queryParams = new URLSearchParams(params);
    const endpoint = `${this.baseEndpoint}?${queryParams.toString()}`;
    return this.client.makeConnectApiRequest('GET', endpoint);
  }

  /**
   * Gets details for a single identity resolution ruleset.
   * @param {string} rulesetNameOrId - The API name or ID of the ruleset
   */
  async getIdentityResolutionRulesetByName(rulesetNameOrId) {
    const endpoint = `${this.baseEndpoint}/${rulesetNameOrId}`;
    return this.client.makeConnectApiRequest('GET', endpoint);
  }

  /**
   * Runs an identity resolution ruleset.
   * @param {string} rulesetNameOrId - The API name or ID of the ruleset to run
   * @param {object} body - Optional body for the run action
   */
  async runIdentityResolutionRulesetNow(rulesetNameOrId, body = null) {
    const endpoint = `${this.baseEndpoint}/${rulesetNameOrId}/actions/run-now`;
    // Actions are typically POST requests
    return this.client.makeConnectApiRequest('POST', endpoint, body);
  }
}