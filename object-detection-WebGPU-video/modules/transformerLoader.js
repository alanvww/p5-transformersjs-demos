import { pipeline,env } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0";

// Since we will download the model from the Hugging Face Hub, we can skip the local model check
env.allowLocalModels = false;

window.transformersPipeline = pipeline;
