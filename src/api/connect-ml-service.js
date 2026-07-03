import { URLSearchParams } from 'url';

/**
 * Service class for all Data Cloud Connect API (Machine Learning) operations.
 * Covers the /ssot/machine-learning/* endpoints from the Data 360 Connect REST API v67.0.
 */
export class ConnectMlService {
  /**
   * @param {import('../salesforce-client.js').SalesforceClient} client
   */
  constructor(client) {
    this.client = client;
    this.apiVersion = client.connectApiVersion;
  }

  get baseEndpoint() {
    return `/services/data/${this.apiVersion}/ssot/machine-learning`;
  }

  // ─── Alerts ──────────────────────────────────────────────────────────────

  async createAlert(body) {
    return this.client.makeConnectApiRequest('POST', `${this.baseEndpoint}/alerts`, body);
  }

  async updateAlert(alertId, body) {
    return this.client.makeConnectApiRequest('PATCH', `${this.baseEndpoint}/alerts/${alertId}`, body);
  }

  // ─── Configured Models ───────────────────────────────────────────────────

  async getConfiguredModels(params = {}) {
    const qs = new URLSearchParams();
    if (params.dataspace) qs.append('dataspace', params.dataspace);
    if (params.limit) qs.append('limit', params.limit);
    if (params.offset) qs.append('offset', params.offset);
    const endpoint = `${this.baseEndpoint}/configured-models${qs.toString() ? `?${qs}` : ''}`;
    return this.client.makeConnectApiRequest('GET', endpoint);
  }

  async getConfiguredModel(configuredModelIdOrName) {
    return this.client.makeConnectApiRequest('GET', `${this.baseEndpoint}/configured-models/${configuredModelIdOrName}`);
  }

  async updateConfiguredModel(configuredModelIdOrName, body) {
    return this.client.makeConnectApiRequest('PATCH', `${this.baseEndpoint}/configured-models/${configuredModelIdOrName}`, body);
  }

  async deleteConfiguredModel(configuredModelIdOrName) {
    return this.client.makeConnectApiRequest('DELETE', `${this.baseEndpoint}/configured-models/${configuredModelIdOrName}`);
  }

  // ─── Predict Jobs ────────────────────────────────────────────────────────

  async getPredictJobs(params = {}) {
    const qs = new URLSearchParams();
    if (params.limit) qs.append('limit', params.limit);
    if (params.offset) qs.append('offset', params.offset);
    const endpoint = `${this.baseEndpoint}/jobs${qs.toString() ? `?${qs}` : ''}`;
    return this.client.makeConnectApiRequest('GET', endpoint);
  }

  async getPredictJob(jobId) {
    return this.client.makeConnectApiRequest('GET', `${this.baseEndpoint}/jobs/${jobId}`);
  }

  async getPredictJobTasks(jobId, params = {}) {
    const qs = new URLSearchParams();
    if (params.limit) qs.append('limit', params.limit);
    if (params.offset) qs.append('offset', params.offset);
    const endpoint = `${this.baseEndpoint}/jobs/${jobId}/tasks${qs.toString() ? `?${qs}` : ''}`;
    return this.client.makeConnectApiRequest('GET', endpoint);
  }

  async getPredictJobTask(jobId, taskId) {
    return this.client.makeConnectApiRequest('GET', `${this.baseEndpoint}/jobs/${jobId}/tasks/${taskId}`);
  }

  // ─── Model Artifacts ─────────────────────────────────────────────────────

  async getModelArtifacts(params = {}) {
    const qs = new URLSearchParams();
    if (params.limit) qs.append('limit', params.limit);
    if (params.offset) qs.append('offset', params.offset);
    const endpoint = `${this.baseEndpoint}/model-artifacts${qs.toString() ? `?${qs}` : ''}`;
    return this.client.makeConnectApiRequest('GET', endpoint);
  }

  async getModelArtifact(modelArtifactIdOrName) {
    return this.client.makeConnectApiRequest('GET', `${this.baseEndpoint}/model-artifacts/${modelArtifactIdOrName}`);
  }

  async updateModelArtifact(modelArtifactIdOrName, body) {
    return this.client.makeConnectApiRequest('PATCH', `${this.baseEndpoint}/model-artifacts/${modelArtifactIdOrName}`, body);
  }

  async deleteModelArtifact(modelArtifactIdOrName) {
    return this.client.makeConnectApiRequest('DELETE', `${this.baseEndpoint}/model-artifacts/${modelArtifactIdOrName}`);
  }

  // ─── Model Setup Versions ────────────────────────────────────────────────

  async getModelSetupVersions(modelSetupIdOrName, params = {}) {
    const qs = new URLSearchParams();
    if (params.limit) qs.append('limit', params.limit);
    if (params.offset) qs.append('offset', params.offset);
    const endpoint = `${this.baseEndpoint}/model-setups/${modelSetupIdOrName}/setup-versions${qs.toString() ? `?${qs}` : ''}`;
    return this.client.makeConnectApiRequest('GET', endpoint);
  }

  async createModelSetupVersion(modelSetupIdOrName, body) {
    return this.client.makeConnectApiRequest('POST', `${this.baseEndpoint}/model-setups/${modelSetupIdOrName}/setup-versions`, body);
  }

  async getModelSetupVersion(modelSetupIdOrName, modelSetupVersionId) {
    return this.client.makeConnectApiRequest('GET', `${this.baseEndpoint}/model-setups/${modelSetupIdOrName}/setup-versions/${modelSetupVersionId}`);
  }

  async updateModelSetupVersion(modelSetupIdOrName, modelSetupVersionId, body) {
    return this.client.makeConnectApiRequest('PATCH', `${this.baseEndpoint}/model-setups/${modelSetupIdOrName}/setup-versions/${modelSetupVersionId}`, body);
  }

  async getModelSetupVersionPartitions(modelSetupIdOrName, modelSetupVersionId, params = {}) {
    const qs = new URLSearchParams();
    if (params.limit) qs.append('limit', params.limit);
    if (params.offset) qs.append('offset', params.offset);
    const endpoint = `${this.baseEndpoint}/model-setups/${modelSetupIdOrName}/setup-versions/${modelSetupVersionId}/partitions${qs.toString() ? `?${qs}` : ''}`;
    return this.client.makeConnectApiRequest('GET', endpoint);
  }

  async getModelSetupVersionPartition(modelSetupIdOrName, modelSetupVersionId, modelSetupPartitionId) {
    return this.client.makeConnectApiRequest('GET', `${this.baseEndpoint}/model-setups/${modelSetupIdOrName}/setup-versions/${modelSetupVersionId}/partitions/${modelSetupPartitionId}`);
  }

  // ─── Prediction Job Definitions ──────────────────────────────────────────

  async getPredictionJobDefinitions(params = {}) {
    const qs = new URLSearchParams();
    if (params.limit) qs.append('limit', params.limit);
    if (params.offset) qs.append('offset', params.offset);
    const endpoint = `${this.baseEndpoint}/prediction-job-definitions${qs.toString() ? `?${qs}` : ''}`;
    return this.client.makeConnectApiRequest('GET', endpoint);
  }

  async createPredictionJobDefinition(body) {
    return this.client.makeConnectApiRequest('POST', `${this.baseEndpoint}/prediction-job-definitions`, body);
  }

  async getPredictionJobDefinition(predictionJobDefinitionId) {
    return this.client.makeConnectApiRequest('GET', `${this.baseEndpoint}/prediction-job-definitions/${predictionJobDefinitionId}`);
  }

  async updatePredictionJobDefinition(predictionJobDefinitionId, body) {
    return this.client.makeConnectApiRequest('PATCH', `${this.baseEndpoint}/prediction-job-definitions/${predictionJobDefinitionId}`, body);
  }

  async deletePredictionJobDefinition(predictionJobDefinitionId) {
    return this.client.makeConnectApiRequest('DELETE', `${this.baseEndpoint}/prediction-job-definitions/${predictionJobDefinitionId}`);
  }
}
