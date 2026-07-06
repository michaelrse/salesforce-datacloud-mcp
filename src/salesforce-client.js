import jsforce from 'jsforce';
import fetch from 'node-fetch';
import { CoreUtilityService } from './api/core-utility-service.js';
import { CacheManager } from './cache-manager.js';
import { ProfileApiService } from './api/profile-service.js';
import { QueryApiService } from './api/query-service.js';
import { MetadataApiService } from './api/metadata-service.js';
import { ConnectSegmentService } from './api/connect-segment-service.js';
import { ConnectIdentityService } from './api/connect-identity-service.js';
import { ConnectConnectionService } from './api/connect-connection-service.js';
import { PersonalizationApiService } from './api/personalization-service.js';
import { ConnectDataModelService } from './api/connect-datamodel-service.js';
import { ConnectMlService } from './api/connect-ml-service.js';
import { CmsContentService } from './api/cms-content-service.js';
import { FlowService } from './api/flow-service.js';
import { DataModelResourceService } from './resources/datamodel-resource-service.js';

export class SalesforceClient {
  constructor() {
    this.conn = new jsforce.Connection({
      loginUrl: process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com'
    });
    this.dataCloudApiVersion = 'v1';
    this.connectApiVersion = 'v64.0';
    this.dataCloudTenantUrl = process.env.DATA_CLOUD_TENANT_URL;
    this.dataCloudAccessToken = null;

    this.cache = new CacheManager();
    this.profile = new ProfileApiService(this);
    this.query = new QueryApiService(this);
    this.metadata = new MetadataApiService(this);
    this.coreUtility = new CoreUtilityService(this);
    this.connectSegment = new ConnectSegmentService(this);
    this.connectIdentity = new ConnectIdentityService(this);
    this.connectConnection = new ConnectConnectionService(this);
    this.personalization = new PersonalizationApiService(this);
    this.connectDataModel = new ConnectDataModelService(this);
    this.connectMl = new ConnectMlService(this);
    this.cmsContent = new CmsContentService(this);
    this.flow = new FlowService(this);
    this.dataModelResources = new DataModelResourceService(this);
  }

  async makeDataCloudRequest(method, endpoint, body = null, isRetry = false) {
    if (!this.dataCloudAccessToken) {
      throw new Error('Not authenticated with Data Cloud. Please call authenticate() first.');
    }
    const url = `https://${this.dataCloudTenantUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.dataCloudAccessToken}`,
      },
    };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(url, options);
    if (response.status === 401 && !isRetry) {
      console.error('Data Cloud token expired — re-authenticating...');
      await this.authenticate();
      return this.makeDataCloudRequest(method, endpoint, body, true);
    }
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Data Cloud API Error Response [${response.status}]: ${errorText || '(empty body)'}`);
      throw new Error(`Data Cloud API request failed with status ${response.status}`);
    }
    if (response.status === 204) return null;
    return response.json();
  }

  async makeConnectApiRequest(method, endpoint, body = null, isRetry = false) {
    if (!this.conn.accessToken || !this.conn.instanceUrl) {
      throw new Error('Not authenticated with core Salesforce. Please call authenticate() first.');
    }
    const url = `${this.conn.instanceUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.conn.accessToken}`,
      },
    };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(url, options);
    if (response.status === 401 && !isRetry) {
      console.error('Core Salesforce token expired — re-authenticating...');
      await this.authenticate();
      return this.makeConnectApiRequest(method, endpoint, body, true);
    }
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Connect API Error Response: ${errorText}`);
      throw new Error(`Connect API request failed with status ${response.status}`);
    }
    if (response.status === 204) return null;
    return response.json();
  }

  async queryDataCloud(sql, limit = null) {
    try {
      let endpoint = `/api/${this.dataCloudApiVersion}/query`;
      if (limit !== null && limit > 0) endpoint += `?limit=${limit}`;
      return await this.makeDataCloudRequest('POST', endpoint, { sql });
    } catch (error) {
      console.error('Data Cloud query failed:', error);
      throw error;
    }
  }

  async exchangeCoreTokenForDataCloudToken() {
    const coreAccessToken = this.conn.accessToken;
    const loginUrl = process.env.SALESFORCE_LOGIN_URL;
    if (!coreAccessToken || !loginUrl) {
      throw new Error('Core access token or SALESFORCE_LOGIN_URL is missing.');
    }
    const tokenExchangeUrl = `${loginUrl}/services/a360/token`;
    const params = new URLSearchParams({
      'grant_type': 'urn:salesforce:grant-type:external:cdp',
      'subject_token': coreAccessToken,
      'subject_token_type': 'urn:ietf:params:oauth:token-type:access_token',
    });
    const response = await fetch(tokenExchangeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Token exchange failed: ${response.status} ${response.statusText} — ${errorText}`);
      throw new Error('Failed to exchange token. See logs for details.');
    }
    const data = await response.json();
    this.dataCloudAccessToken = data.access_token;
    this.dataCloudTenantUrl = data.instance_url;
  }

  async authenticate() {
    try {
      const clientId = process.env.SALESFORCE_CLIENT_ID;
      const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
      if (clientId && clientSecret) {
        await this.authenticateWithOAuth(clientId, clientSecret);
      } else {
        await this.authenticateWithPassword();
      }
      await this.exchangeCoreTokenForDataCloudToken();

      console.error('Initializing server caches...');
      await this.cache.initializeCaches(this);
      this.cache.startBackgroundRefreshJobs(this);
      console.error('Background cache refresh jobs scheduled.');
    } catch (error) {
      console.error('Authentication process failed:', error);
      throw error;
    }
  }

  async authenticateWithOAuth(clientId, clientSecret) {
    const loginUrl = process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com';
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    });
    const response = await fetch(`${loginUrl}/services/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OAuth authentication failed: ${error}`);
    }
    const data = await response.json();
    this.conn.accessToken = data.access_token;
    this.conn.instanceUrl = data.instance_url;
  }

  async authenticateWithPassword() {
    const username = process.env.SALESFORCE_USERNAME;
    const password = process.env.SALESFORCE_PASSWORD;
    const securityToken = process.env.SALESFORCE_SECURITY_TOKEN || '';
    if (!username || !password) {
      throw new Error('Missing Salesforce username/password credentials in environment variables.');
    }
    await this.conn.login(username, password + securityToken);
  }
}
