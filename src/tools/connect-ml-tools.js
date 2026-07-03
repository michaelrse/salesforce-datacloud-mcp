/**
 * Data Cloud Connect API tools for Machine Learning.
 * Covers alerts, configured models, predict jobs, model artifacts,
 * model setup versions, and prediction job definitions.
 * Tool names are prefixed with "connect_ml_".
 */

// ─── Alerts ────────────────────────────────────────────────────────────────

const createAlert = {
  definition: {
    name: 'connect_ml_create_alert',
    description: `
      Create a data alert for a Machine Learning model in Data Cloud.
      Use this tool to configure threshold-based alerts on ML model metrics or predictions.

      The 'body' parameter is a JSON string defining the alert configuration.

      Returns: The created alert object with its ID and status.

      Common errors:
      - 400: Missing required fields or invalid alert configuration.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        body: {
          type: 'string',
          description: 'Required. JSON string defining the alert. Example: "{\\"name\\": \\"MyAlert\\", \\"threshold\\": 0.9}"',
        },
      },
      required: ['body'],
    },
  },
  handler: async (args, sfClient) => {
    const body = JSON.parse(args.body);
    return sfClient.connectMl.createAlert(body);
  },
};

const updateAlert = {
  definition: {
    name: 'connect_ml_update_alert',
    description: `
      Update an existing ML data alert by its ID.

      The 'body' parameter is a JSON string with only the fields you want to change.

      Returns: The updated alert object.

      Common errors:
      - 404: Alert not found.
      - 400: Invalid fields in body.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        alertId: {
          type: 'string',
          description: 'The ID of the alert to update.',
        },
        body: {
          type: 'string',
          description: 'Required. JSON string of fields to update.',
        },
      },
      required: ['alertId', 'body'],
    },
  },
  handler: async (args, sfClient) => {
    const body = JSON.parse(args.body);
    return sfClient.connectMl.updateAlert(args.alertId, body);
  },
};

// ─── Configured Models ─────────────────────────────────────────────────────

const getConfiguredModels = {
  definition: {
    name: 'connect_ml_get_configured_models',
    description: `
      Get a list of all configured ML models in Data Cloud.
      A configured model links a model artifact to a Data Cloud object for scoring.

      Use cases:
      - List all models set up for prediction.
      - Find a configured model by name to get its ID.
      - Audit which models are active.

      Returns: An array of configured model objects.

      Common errors:
      - 403: Insufficient permissions.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        dataspace: { type: 'string', description: 'Optional. Filter by dataspace. Defaults to "default".' },
        limit: { type: 'number', description: 'Optional. Max number of records to return.' },
        offset: { type: 'number', description: 'Optional. Offset for pagination.' },
      },
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.connectMl.getConfiguredModels(args);
  },
};

const getConfiguredModel = {
  definition: {
    name: 'connect_ml_get_configured_model',
    description: `
      Get the details of a single configured ML model by its ID or name.

      Use cases:
      - Inspect the configuration, status, and mapping of a specific model.
      - Verify model setup before running a prediction job.

      Returns: A single configured model object.

      Common errors:
      - 404: Configured model not found.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        configuredModelIdOrName: {
          type: 'string',
          description: 'The ID or developer name of the configured model.',
        },
      },
      required: ['configuredModelIdOrName'],
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.connectMl.getConfiguredModel(args.configuredModelIdOrName);
  },
};

const updateConfiguredModel = {
  definition: {
    name: 'connect_ml_update_configured_model',
    description: `
      Update an existing configured ML model by its ID or name.
      Use this to change the model's configuration, such as its target DMO mapping or schedule.

      The 'body' parameter is a JSON string with only the fields you want to change.

      Returns: The updated configured model object.

      Common errors:
      - 404: Configured model not found.
      - 400: Invalid fields in body.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        configuredModelIdOrName: {
          type: 'string',
          description: 'The ID or developer name of the configured model to update.',
        },
        body: {
          type: 'string',
          description: 'Required. JSON string of fields to update.',
        },
      },
      required: ['configuredModelIdOrName', 'body'],
    },
  },
  handler: async (args, sfClient) => {
    const body = JSON.parse(args.body);
    return sfClient.connectMl.updateConfiguredModel(args.configuredModelIdOrName, body);
  },
};

const deleteConfiguredModel = {
  definition: {
    name: 'connect_ml_delete_configured_model',
    description: `
      Delete a configured ML model by its ID or name.
      This removes the model configuration from Data Cloud but does not delete the underlying model artifact.

      Returns: null (204 No Content) on success.

      Common errors:
      - 404: Configured model not found.
      - 400: Model cannot be deleted (e.g., it has active jobs).
    `,
    inputSchema: {
      type: 'object',
      properties: {
        configuredModelIdOrName: {
          type: 'string',
          description: 'The ID or developer name of the configured model to delete.',
        },
      },
      required: ['configuredModelIdOrName'],
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.connectMl.deleteConfiguredModel(args.configuredModelIdOrName);
  },
};

// ─── Predict Jobs ──────────────────────────────────────────────────────────

const getPredictJobs = {
  definition: {
    name: 'connect_ml_get_predict_jobs',
    description: `
      Get a list of ML prediction job runs in Data Cloud.
      Each job represents a single execution of a prediction job definition.

      Use cases:
      - Check the status of recent prediction runs.
      - Find failed jobs for debugging.
      - Audit prediction job history.

      Returns: An array of predict job objects with status, start time, and end time.

      Common errors:
      - 403: Insufficient permissions.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Optional. Max number of records to return.' },
        offset: { type: 'number', description: 'Optional. Offset for pagination.' },
      },
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.connectMl.getPredictJobs(args);
  },
};

const getPredictJob = {
  definition: {
    name: 'connect_ml_get_predict_job',
    description: `
      Get the details and status of a single ML prediction job by its ID.

      Use cases:
      - Check whether a specific prediction job completed successfully.
      - Get the job's start/end times and error details.

      Returns: A single predict job object.

      Common errors:
      - 404: Job not found.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        jobId: { type: 'string', description: 'The ID of the predict job.' },
      },
      required: ['jobId'],
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.connectMl.getPredictJob(args.jobId);
  },
};

const getPredictJobTasks = {
  definition: {
    name: 'connect_ml_get_predict_job_tasks',
    description: `
      Get the list of tasks within a specific ML prediction job.
      A job is composed of one or more tasks, each representing a partition or subset of the scoring workload.

      Returns: An array of task objects with status and metadata.

      Common errors:
      - 404: Job not found.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        jobId: { type: 'string', description: 'The ID of the predict job.' },
        limit: { type: 'number', description: 'Optional. Max number of records to return.' },
        offset: { type: 'number', description: 'Optional. Offset for pagination.' },
      },
      required: ['jobId'],
    },
  },
  handler: async (args, sfClient) => {
    const { jobId, ...params } = args;
    return sfClient.connectMl.getPredictJobTasks(jobId, params);
  },
};

const getPredictJobTask = {
  definition: {
    name: 'connect_ml_get_predict_job_task',
    description: `
      Get the details of a single task within an ML prediction job.

      Returns: A single predict job task object with status, error info, and metrics.

      Common errors:
      - 404: Job or task not found.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        jobId: { type: 'string', description: 'The ID of the predict job.' },
        taskId: { type: 'string', description: 'The ID of the task within the job.' },
      },
      required: ['jobId', 'taskId'],
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.connectMl.getPredictJobTask(args.jobId, args.taskId);
  },
};

// ─── Model Artifacts ───────────────────────────────────────────────────────

const getModelArtifacts = {
  definition: {
    name: 'connect_ml_get_model_artifacts',
    description: `
      Get a list of all ML model artifacts registered in Data Cloud.
      A model artifact is the underlying trained ML model file (e.g., from Einstein, Bring-Your-Own-Model, etc.).

      Use cases:
      - Discover available models before configuring them.
      - Find a model artifact ID or name for use in a configured model.
      - Audit model versions.

      Returns: An array of model artifact objects.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Optional. Max number of records to return.' },
        offset: { type: 'number', description: 'Optional. Offset for pagination.' },
      },
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.connectMl.getModelArtifacts(args);
  },
};

const getModelArtifact = {
  definition: {
    name: 'connect_ml_get_model_artifact',
    description: `
      Get the details of a single ML model artifact by its ID or name.

      Returns: A single model artifact object including type, status, and metadata.

      Common errors:
      - 404: Model artifact not found.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        modelArtifactIdOrName: {
          type: 'string',
          description: 'The ID or developer name of the model artifact.',
        },
      },
      required: ['modelArtifactIdOrName'],
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.connectMl.getModelArtifact(args.modelArtifactIdOrName);
  },
};

const updateModelArtifact = {
  definition: {
    name: 'connect_ml_update_model_artifact',
    description: `
      Update an existing ML model artifact by its ID or name.

      The 'body' parameter is a JSON string with only the fields you want to change.

      Returns: The updated model artifact object.

      Common errors:
      - 404: Model artifact not found.
      - 400: Invalid fields in body.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        modelArtifactIdOrName: {
          type: 'string',
          description: 'The ID or developer name of the model artifact to update.',
        },
        body: {
          type: 'string',
          description: 'Required. JSON string of fields to update.',
        },
      },
      required: ['modelArtifactIdOrName', 'body'],
    },
  },
  handler: async (args, sfClient) => {
    const body = JSON.parse(args.body);
    return sfClient.connectMl.updateModelArtifact(args.modelArtifactIdOrName, body);
  },
};

const deleteModelArtifact = {
  definition: {
    name: 'connect_ml_delete_model_artifact',
    description: `
      Delete an ML model artifact by its ID or name.
      Note: You cannot delete a model artifact that is referenced by an active configured model.

      Returns: null (204 No Content) on success.

      Common errors:
      - 404: Model artifact not found.
      - 400: Artifact is in use by a configured model and cannot be deleted.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        modelArtifactIdOrName: {
          type: 'string',
          description: 'The ID or developer name of the model artifact to delete.',
        },
      },
      required: ['modelArtifactIdOrName'],
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.connectMl.deleteModelArtifact(args.modelArtifactIdOrName);
  },
};

// ─── Model Setup Versions ──────────────────────────────────────────────────

const getModelSetupVersions = {
  definition: {
    name: 'connect_ml_get_model_setup_versions',
    description: `
      Get all setup versions for a specific ML model setup.
      Model setup versions represent the versioned configuration of how a model is deployed.

      Returns: An array of model setup version objects.

      Common errors:
      - 404: Model setup not found.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        modelSetupIdOrName: {
          type: 'string',
          description: 'The ID or developer name of the model setup.',
        },
        limit: { type: 'number', description: 'Optional. Max number of records to return.' },
        offset: { type: 'number', description: 'Optional. Offset for pagination.' },
      },
      required: ['modelSetupIdOrName'],
    },
  },
  handler: async (args, sfClient) => {
    const { modelSetupIdOrName, ...params } = args;
    return sfClient.connectMl.getModelSetupVersions(modelSetupIdOrName, params);
  },
};

const createModelSetupVersion = {
  definition: {
    name: 'connect_ml_create_model_setup_version',
    description: `
      Create a new version of a model setup configuration.
      Use this when you want to update a model's deployment configuration without losing the prior version.

      The 'body' parameter is a JSON string defining the new version.

      Returns: The newly created model setup version object.

      Common errors:
      - 404: Model setup not found.
      - 400: Invalid body.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        modelSetupIdOrName: {
          type: 'string',
          description: 'The ID or developer name of the model setup.',
        },
        body: {
          type: 'string',
          description: 'Required. JSON string defining the new version.',
        },
      },
      required: ['modelSetupIdOrName', 'body'],
    },
  },
  handler: async (args, sfClient) => {
    const body = JSON.parse(args.body);
    return sfClient.connectMl.createModelSetupVersion(args.modelSetupIdOrName, body);
  },
};

const getModelSetupVersion = {
  definition: {
    name: 'connect_ml_get_model_setup_version',
    description: `
      Get a specific version of a model setup by its version ID.

      Returns: A single model setup version object with its full configuration.

      Common errors:
      - 404: Model setup or version not found.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        modelSetupIdOrName: {
          type: 'string',
          description: 'The ID or developer name of the model setup.',
        },
        modelSetupVersionId: {
          type: 'string',
          description: 'The ID of the model setup version.',
        },
      },
      required: ['modelSetupIdOrName', 'modelSetupVersionId'],
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.connectMl.getModelSetupVersion(args.modelSetupIdOrName, args.modelSetupVersionId);
  },
};

const updateModelSetupVersion = {
  definition: {
    name: 'connect_ml_update_model_setup_version',
    description: `
      Update an existing model setup version.

      The 'body' parameter is a JSON string with only the fields you want to change.

      Returns: The updated model setup version object.

      Common errors:
      - 404: Model setup or version not found.
      - 400: Invalid fields in body.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        modelSetupIdOrName: {
          type: 'string',
          description: 'The ID or developer name of the model setup.',
        },
        modelSetupVersionId: {
          type: 'string',
          description: 'The ID of the model setup version to update.',
        },
        body: {
          type: 'string',
          description: 'Required. JSON string of fields to update.',
        },
      },
      required: ['modelSetupIdOrName', 'modelSetupVersionId', 'body'],
    },
  },
  handler: async (args, sfClient) => {
    const body = JSON.parse(args.body);
    return sfClient.connectMl.updateModelSetupVersion(args.modelSetupIdOrName, args.modelSetupVersionId, body);
  },
};

const getModelSetupVersionPartitions = {
  definition: {
    name: 'connect_ml_get_model_setup_version_partitions',
    description: `
      Get all partitions for a specific model setup version.
      Partitions represent subsets of data that the model scores in parallel.

      Returns: An array of partition objects.

      Common errors:
      - 404: Model setup or version not found.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        modelSetupIdOrName: {
          type: 'string',
          description: 'The ID or developer name of the model setup.',
        },
        modelSetupVersionId: {
          type: 'string',
          description: 'The ID of the model setup version.',
        },
        limit: { type: 'number', description: 'Optional. Max number of records to return.' },
        offset: { type: 'number', description: 'Optional. Offset for pagination.' },
      },
      required: ['modelSetupIdOrName', 'modelSetupVersionId'],
    },
  },
  handler: async (args, sfClient) => {
    const { modelSetupIdOrName, modelSetupVersionId, ...params } = args;
    return sfClient.connectMl.getModelSetupVersionPartitions(modelSetupIdOrName, modelSetupVersionId, params);
  },
};

const getModelSetupVersionPartition = {
  definition: {
    name: 'connect_ml_get_model_setup_version_partition',
    description: `
      Get a specific partition of a model setup version by its partition ID.

      Returns: A single partition object with its configuration and status.

      Common errors:
      - 404: Model setup, version, or partition not found.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        modelSetupIdOrName: {
          type: 'string',
          description: 'The ID or developer name of the model setup.',
        },
        modelSetupVersionId: {
          type: 'string',
          description: 'The ID of the model setup version.',
        },
        modelSetupPartitionId: {
          type: 'string',
          description: 'The ID of the partition.',
        },
      },
      required: ['modelSetupIdOrName', 'modelSetupVersionId', 'modelSetupPartitionId'],
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.connectMl.getModelSetupVersionPartition(
      args.modelSetupIdOrName,
      args.modelSetupVersionId,
      args.modelSetupPartitionId
    );
  },
};

// ─── Prediction Job Definitions ────────────────────────────────────────────

const getPredictionJobDefinitions = {
  definition: {
    name: 'connect_ml_get_prediction_job_definitions',
    description: `
      Get a list of all ML prediction job definitions in Data Cloud.
      A prediction job definition configures how and when batch scoring runs (model, DMO, schedule, etc.).

      Use cases:
      - List all prediction job definitions to find one by name.
      - Check which definitions are active.
      - Find the ID of a definition to update or delete it.

      Returns: An array of prediction job definition objects.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Optional. Max number of records to return.' },
        offset: { type: 'number', description: 'Optional. Offset for pagination.' },
      },
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.connectMl.getPredictionJobDefinitions(args);
  },
};

const createPredictionJobDefinition = {
  definition: {
    name: 'connect_ml_create_prediction_job_definition',
    description: `
      Create a new ML prediction job definition in Data Cloud.
      This defines a batch scoring configuration: which model to use, which DMO to score,
      output field mappings, and an optional schedule.

      The 'body' parameter is a JSON string defining the full prediction job definition.

      Returns: The newly created prediction job definition object with its ID and status.

      Common errors:
      - 400: Missing required fields or invalid body.
      - 409: A prediction job definition with this name already exists.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        body: {
          type: 'string',
          description: 'Required. JSON string defining the prediction job definition.',
        },
      },
      required: ['body'],
    },
  },
  handler: async (args, sfClient) => {
    const body = JSON.parse(args.body);
    return sfClient.connectMl.createPredictionJobDefinition(body);
  },
};

const getPredictionJobDefinition = {
  definition: {
    name: 'connect_ml_get_prediction_job_definition',
    description: `
      Get the details of a single ML prediction job definition by its ID.

      Use cases:
      - Inspect the configuration of a specific prediction job (model, DMO, schedule).
      - Verify settings before triggering a run.

      Returns: A single prediction job definition object.

      Common errors:
      - 404: Prediction job definition not found.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        predictionJobDefinitionId: {
          type: 'string',
          description: 'The ID of the prediction job definition.',
        },
      },
      required: ['predictionJobDefinitionId'],
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.connectMl.getPredictionJobDefinition(args.predictionJobDefinitionId);
  },
};

const updatePredictionJobDefinition = {
  definition: {
    name: 'connect_ml_update_prediction_job_definition',
    description: `
      Update an existing ML prediction job definition by its ID.

      The 'body' parameter is a JSON string with only the fields you want to change.

      Returns: The updated prediction job definition object.

      Common errors:
      - 404: Prediction job definition not found.
      - 400: Invalid fields in body.
    `,
    inputSchema: {
      type: 'object',
      properties: {
        predictionJobDefinitionId: {
          type: 'string',
          description: 'The ID of the prediction job definition to update.',
        },
        body: {
          type: 'string',
          description: 'Required. JSON string of fields to update.',
        },
      },
      required: ['predictionJobDefinitionId', 'body'],
    },
  },
  handler: async (args, sfClient) => {
    const body = JSON.parse(args.body);
    return sfClient.connectMl.updatePredictionJobDefinition(args.predictionJobDefinitionId, body);
  },
};

const deletePredictionJobDefinition = {
  definition: {
    name: 'connect_ml_delete_prediction_job_definition',
    description: `
      Delete an ML prediction job definition by its ID.

      Returns: null (204 No Content) on success.

      Common errors:
      - 404: Prediction job definition not found.
      - 400: Definition cannot be deleted (e.g., it has active jobs).
    `,
    inputSchema: {
      type: 'object',
      properties: {
        predictionJobDefinitionId: {
          type: 'string',
          description: 'The ID of the prediction job definition to delete.',
        },
      },
      required: ['predictionJobDefinitionId'],
    },
  },
  handler: async (args, sfClient) => {
    return sfClient.connectMl.deletePredictionJobDefinition(args.predictionJobDefinitionId);
  },
};

// ─── Export ────────────────────────────────────────────────────────────────

export const connectMlTools = [
  // Alerts
  createAlert,
  updateAlert,
  // Configured Models
  getConfiguredModels,
  getConfiguredModel,
  updateConfiguredModel,
  deleteConfiguredModel,
  // Predict Jobs
  getPredictJobs,
  getPredictJob,
  getPredictJobTasks,
  getPredictJobTask,
  // Model Artifacts
  getModelArtifacts,
  getModelArtifact,
  updateModelArtifact,
  deleteModelArtifact,
  // Model Setup Versions
  getModelSetupVersions,
  createModelSetupVersion,
  getModelSetupVersion,
  updateModelSetupVersion,
  getModelSetupVersionPartitions,
  getModelSetupVersionPartition,
  // Prediction Job Definitions
  getPredictionJobDefinitions,
  createPredictionJobDefinition,
  getPredictionJobDefinition,
  updatePredictionJobDefinition,
  deletePredictionJobDefinition,
];
