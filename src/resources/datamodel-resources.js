/**
 * All resources related to Data Cloud Data Model Objects (DMOs).
 * These provide schema and metadata context to Claude.
 */

// --- Resource: All DMO List ---
const allDMOsResource = {
  definition: {
    uri: 'salesforce://datamodel/dmos',
    name: 'All Data Model Objects',
    description: 'Complete list of all DMOs in Data Cloud with their metadata (id, developerName, label, status, category)',
    mimeType: 'application/json',
  },
  handler: async (sfClient) => {
    // Fetch all DMOs (no filters, get everything)
    const result = await sfClient.connectDataModel.getDataModelObjects({});
    
    return {
      uri: 'salesforce://datamodel/dmos',
      mimeType: 'application/json',
      text: JSON.stringify(result, null, 2),
    };
  }
};

// --- Resource: Individual DMO Schema ---
const individualDMOResource = {
  definition: {
    uri: 'salesforce://datamodel/dmo/individual',
    name: 'Individual DMO Schema',
    description: 'Complete schema for ssot__Individual__dlm including all fields, data types, indexes, and primary key',
    mimeType: 'application/json',
  },
  handler: async (sfClient) => {
    const result = await sfClient.connectDataModel.getDataModelObjectByName('ssot__Individual__dlm');
    
    return {
      uri: 'salesforce://datamodel/dmo/individual',
      mimeType: 'application/json',
      text: JSON.stringify(result, null, 2),
    };
  }
};

// --- Resource: Contact Point Email DMO Schema ---
const contactPointEmailDMOResource = {
  definition: {
    uri: 'salesforce://datamodel/dmo/contactpointemail',
    name: 'Contact Point Email DMO Schema',
    description: 'Complete schema for ssot__ContactPointEmail__dlm including all fields, data types, indexes, and primary key',
    mimeType: 'application/json',
  },
  handler: async (sfClient) => {
    const result = await sfClient.connectDataModel.getDataModelObjectByName('ssot__ContactPointEmail__dlm');
    
    return {
      uri: 'salesforce://datamodel/dmo/contactpointemail',
      mimeType: 'application/json',
      text: JSON.stringify(result, null, 2),
    };
  }
};

// --- Resource: Unified Individual DMO Schema ---
const unifiedIndividualDMOResource = {
  definition: {
    uri: 'salesforce://datamodel/dmo/unifiedindividual',
    name: 'Unified Individual DMO Schema',
    description: 'Complete schema for UnifiedIndividual__dlm including all fields, data types, indexes, and primary key',
    mimeType: 'application/json',
  },
  handler: async (sfClient) => {
    const result = await sfClient.connectDataModel.getDataModelObjectByName('UnifiedIndividual__dlm');
    
    return {
      uri: 'salesforce://datamodel/dmo/unifiedindividual',
      mimeType: 'application/json',
      text: JSON.stringify(result, null, 2),
    };
  }
};

// --- Export all resources in an array ---
export const dataModelResources = [
  allDMOsResource,
  individualDMOResource,
  contactPointEmailDMOResource,
  unifiedIndividualDMOResource,
];