import { pipeline, env } from './transformers.js';

// Since we will download the model from the Hugging Face Hub, we can skip the local model check
env.allowLocalModels = false;

// Export the pipeline funco it can be used in other files
window.transformersPipeline = pipeline;
