import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/hf_transformers';

export function createEmbeddings() {
  return new HuggingFaceTransformersEmbeddings({
    modelName: 'Xenova/all-MiniLM-L6-v2',
  });
}
