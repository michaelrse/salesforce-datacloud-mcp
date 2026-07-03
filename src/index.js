import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { SalesforceClient } from './salesforce-client.js';
import { coreUtilityTools } from './tools/core-utility-tools.js';
import { profileTools } from './tools/profile-tools.js';
import { queryTools } from './tools/query-tools.js';
import { metadataTools } from './tools/metadata-tools.js';
import { connectSegmentTools } from './tools/connect-segment-tools.js';
import { connectIdentityTools } from './tools/connect-identity-tools.js';
import { connectConnectionTools } from './tools/connect-connection-tools.js';
import { personalizationTools } from './tools/personalization-tools.js';
import { connectDataModelTools } from './tools/connect-datamodel-tools.js';
import { connectMlTools } from './tools/connect-ml-tools.js';
import { cmsContentTools } from './tools/cms-content-tools.js';
import { flowTools } from './tools/flow-tools.js';
import { dataModelResources } from './resources/datamodel-resources.js';
import { resourceAccessTools } from './tools/resource-access-tools.js';

const allToolModules = [
  ...profileTools,
  ...queryTools,
  ...metadataTools,
  ...connectSegmentTools,
  ...connectIdentityTools,
  ...connectConnectionTools,
  ...personalizationTools,
  ...connectDataModelTools,
  ...coreUtilityTools,
  ...connectMlTools,
  ...cmsContentTools,
  ...flowTools,
  ...resourceAccessTools,
];

const allResourceModules = [...dataModelResources];

const resources = allResourceModules.map((m) => m.definition);
const resourceHandlers = new Map(allResourceModules.map((m) => [m.definition.uri, m.handler]));
const tools = allToolModules.map((m) => m.definition);
const toolHandlers = new Map(allToolModules.map((m) => [m.definition.name, m.handler]));

const sfClient = new SalesforceClient();

function createMcpServer() {
  const server = new Server(
    { name: 'salesforce-data-cloud-mcp', version: '1.0.0' },
    { capabilities: { tools: {}, resources: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const { name, arguments: args } = request.params;
      const handler = toolHandlers.get(name);
      if (!handler) throw new Error(`Unknown tool: ${name}`);
      return await handler(args, sfClient);
    } catch (error) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: error.message }) }],
        isError: true,
      };
    }
  });

  server.setRequestHandler(ListResourcesRequestSchema, async () => ({ resources }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    try {
      const { uri } = request.params;
      const handler = resourceHandlers.get(uri);
      if (!handler) throw new Error(`Unknown resource: ${uri}`);
      return { contents: [await handler(sfClient)] };
    } catch (error) {
      return {
        contents: [{
          uri: request.params.uri,
          mimeType: 'text/plain',
          text: `Error: ${error.message}`,
        }],
        isError: true,
      };
    }
  });

  return server;
}

async function main() {
  console.error('Authenticating with Salesforce...');
  await sfClient.authenticate();
  console.error('Authentication complete.');

  const app = express();
  app.use(express.json());

  // Health check for Cloud Run
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // Stateless MCP endpoint — each request gets its own transport
  app.post('/mcp', async (req, res) => {
    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on('close', () => server.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  const port = parseInt(process.env.PORT || '8080', 10);
  app.listen(port, () => {
    console.error(`Salesforce Data Cloud MCP Server listening on port ${port}`);
  });
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
