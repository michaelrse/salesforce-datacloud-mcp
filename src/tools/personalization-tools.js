/**
 * All tool modules related to the Data Cloud Personalization API.
 */

// --- Tool: get_personalization_decisions ---
const getPersonalizationDecisions = {
  definition: {
    name: 'get_personalization_decisions',
    description: `Requests recommendations for profiles also called personalization decisions from Salesforce Data Cloud's Personalization & Decisioning engine.

**What are Personalization Points?**
Personalization points are pre-configured decision strategies in Data Cloud that serve recommendations, offers, or content to individuals. Examples include: product recommendations, next best actions, personalized content, or promotional offers. Each personalization point has a unique name configured by admins.

**BEFORE CALLING THIS TOOL:**
- If the user has NOT specified a personalization point name, ASK them which one to use
- Do NOT guess or try default names like 'DefaultPersonalizationPoint'
- Personalization point names are case-sensitive and must match exactly

**Parameter Requirements:**

*Required:*
- personalizationPoints[].name OR personalizationPoints[].id: The exact name (e.g., 'ProductRecommendations') or core ID of the personalization point
  - ASK USER if unknown - do not guess
  - Names are configured by Data Cloud admins

*Context (at least one identifier required):*
- context.individualId: The ID from the source Individual record
- context.unifiedIndividualId: The unified individual ID (recommended)
  - Can be queried from UnifiedIndividual__dlm if user provides name/email
  - Use this for cross-source unified profiles

*Optional Context Fields:*
- context.dataspace: Defaults to "default" if not specified
- context.anchorId + context.anchorType: For contextual recommendations (e.g., anchorId=productId, anchorType='Product')
- context.messageId: For tracking specific campaigns or messages
- context.correlationId: For linking related requests
- context.requestUrl: Current page/context URL
- context.customContextVariable: Additional business-specific context

*Execution Flags (optional array):*
- "TestMode": Returns decisions without recording interactions (useful for testing)
- "ContextOnly": Returns only the context evaluation without executing the full decision logic

*Advanced:*
- personalizationPoints[].decisionId: Override with a specific decision ID (testing only)
- profile: Provide a pre-fetched Data Cloud Hot Layer Profile to skip profile retrieval (optimization)

**When to ASK the user:**
1. User says 'get recommendations/decisions' without specifying which personalization point
2. User doesn't provide enough context to determine the right personalization point
3. User doesn't provide any individual identifier (ID, email, name, etc.)

**When to PROCEED directly:**
1. User explicitly names the personalization point (e.g., "use ProductRecommendations personalization point")
2. User provides both personalization point name AND individual identifier

**Common Use Cases:**
- "Get product recommendations for customer john@example.com using the ProductRecommendations point"
- "Show me next best action for unified individual ID abc123"
- "Get personalized content decisions for Jane Doe"

**What this returns:**
- A decisions object containing recommended items/actions for the specified individual
- Each decision typically includes: item details, relevance scores, reasoning, and metadata
- May include attribution information showing why decisions were made

**Common Errors:**
- 404: Personalization point name not found (check spelling/case)
- 400: Missing required context (need at least one individual identifier)
- 400: Invalid individualId or unifiedIndividualId (ID doesn't exist)
- 403: Insufficient permissions to access personalization decisions

**Best Practices:**
1. Use unifiedIndividualId when possible for cross-source recommendations
2. Include anchorId/anchorType for contextual recommendations (e.g., "customers who viewed this product")
3. Use TestMode flag when testing to avoid polluting analytics data
4. Query for the individual ID first if user provides name/email instead of ID`,
    inputSchema: {
      type: 'object',
      properties: {
        context: {
          type: 'object',
          description: 'Details that define the circumstances of the request (e.g., individualId, dataspace).',
          properties: {
            individualId: { type: 'string' },
            unifiedIndividualId: { type: 'string' },
            dataspace: { type: 'string' },
            anchorId: { type: 'string' },
            anchorType: { type: 'string' },
            correlationId: { type: 'string' },
            messageId: { type: 'string' },
            requestUrl: { type: 'string' },
            customContextVariable: { type: 'string' },
          },
        },
        personalizationPoints: {
          type: 'array',
          description: 'Details of the personalization points used in this request.',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The core ID of a personalization point. Optional if name is provided.',
              },
              name: {
                type: 'string',
                description: 'The API name of a personalization point. Optional if id is provided.',
              },
              decisionId: {
                type: 'string',
                description: 'Optional ID of a specific decision to return for testing.',
              },
            },
          },
        },
        profile: {
          type: 'object',
          description: 'A Data Cloud Hot Layer Profile. If provided, the API uses this profile and skips retrieval.',
        },
        executionFlags: {
          type: 'array',
          description: 'Enumerated values to control execution.',
          items: {
            type: 'string',
            enum: ['TestMode', 'ContextOnly'],
          },
        },
      },
      required: ['personalizationPoints'],
    },
  },
  handler: async (args, sfClient) => {
    // The 'args' object from the MCP request perfectly matches the API's request body
    // thanks to the inputSchema we just defined.
    const decisions = await sfClient.personalization.getDecisions(args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(decisions, null, 2),
        },
      ],
    };
  },
};

// --- Export all tools in an array ---
export const personalizationTools = [
  getPersonalizationDecisions,
];