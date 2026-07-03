import { URLSearchParams } from 'url';

/**
 * Service class for Salesforce Flow metadata operations.
 * Uses the Tooling API to list and inspect Flows.
 * Base path: /services/data/{version}/tooling/
 */
export class FlowService {
  /**
   * @param {import('../salesforce-client.js').SalesforceClient} client
   */
  constructor(client) {
    this.client = client;
    this.apiVersion = client.connectApiVersion;
  }

  get toolingBase() {
    return `/services/data/${this.apiVersion}/tooling`;
  }

  /**
   * Lists flows in the org via Tooling API SOQL.
   * @param {object} params - Optional filters
   * @param {string} params.status - Filter by status (e.g. "Active", "Draft", "Obsolete", "InvalidDraft")
   * @param {string} params.processType - Filter by process type (e.g. "Flow", "Workflow", "AutoLaunchedFlow")
   * @param {string} params.namePrefix - Filter MasterLabel starting with this prefix (e.g. "flow_701" for campaign flows)
   * @param {number} params.limit - Max number of records to return
   */
  async listFlows(params = {}) {
    const fields = [
      'Id',
      'MasterLabel',
      'ApiVersion',
      'Status',
      'ProcessType',
      'Description',
      'CreatedDate',
      'LastModifiedDate',
      'Definition.DeveloperName',
      'Definition.NamespacePrefix',
    ].join(',');

    const where = [];
    if (params.status) where.push(`Status='${params.status}'`);
    if (params.processType) where.push(`ProcessType='${params.processType}'`);
    if (params.namePrefix) where.push(`MasterLabel LIKE '${params.namePrefix}%'`);

    let soql = `SELECT ${fields} FROM Flow`;
    if (where.length) soql += ` WHERE ${where.join(' AND ')}`;
    soql += ' ORDER BY LastModifiedDate DESC';
    if (params.limit) soql += ` LIMIT ${params.limit}`;

    const qs = new URLSearchParams({ q: soql });
    const endpoint = `${this.toolingBase}/query/?${qs}`;
    return this.client.makeConnectApiRequest('GET', endpoint);
  }

  /**
   * Gets a single Flow record by its 18-character Id, including its Metadata blob.
   * @param {string} flowId - The 18-char Id of the Flow record (starts with "301...")
   */
  async getFlow(flowId) {
    const endpoint = `${this.toolingBase}/sobjects/Flow/${flowId}`;
    return this.client.makeConnectApiRequest('GET', endpoint);
  }

  /**
   * Lists Flow Definitions (one per logical flow, regardless of versions).
   * Useful to see the "header" of each flow and its ActiveVersionId.
   * @param {object} params - Optional filters
   * @param {number} params.limit - Max records to return
   */
  async listFlowDefinitions(params = {}) {
    const fields = [
      'Id',
      'DeveloperName',
      'MasterLabel',
      'NamespacePrefix',
      'ActiveVersionId',
      'LatestVersionId',
      'Description',
    ].join(',');

    let soql = `SELECT ${fields} FROM FlowDefinition ORDER BY DeveloperName`;
    if (params.limit) soql += ` LIMIT ${params.limit}`;

    const qs = new URLSearchParams({ q: soql });
    const endpoint = `${this.toolingBase}/query/?${qs}`;
    return this.client.makeConnectApiRequest('GET', endpoint);
  }

  /**
   * Convenience: list flows associated with Marketing Cloud campaigns.
   * Campaign flows follow the naming pattern: flow_{campaignId}_{epochMs}
   * @param {string} campaignId - Optional. If provided, filters to flows for a specific campaign.
   */
  async listCampaignFlows(campaignId = null) {
    const prefix = campaignId ? `flow_${campaignId}_` : 'flow_';
    return this.listFlows({ namePrefix: prefix });
  }

  /**
   * Invokes an On-Demand Flow via the REST Actions endpoint.
   * Used to trigger transactional messaging (e.g. OTPs, order confirmations).
   * Endpoint: POST /services/data/{version}/actions/custom/flow/{flowApiName}
   *
   * @param {string} flowApiName - The API name of the On-Demand Flow to invoke
   * @param {object[]} inputs - Array of input objects. Each entry maps to one Flow run.
   *                            Keys must match the Flow's "Available for Input" resources.
   */
  async invokeFlow(flowApiName, inputs) {
    const endpoint = `/services/data/${this.apiVersion}/actions/custom/flow/${flowApiName}`;
    return this.client.makeConnectApiRequest('POST', endpoint, { inputs });
  }
}
