"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmbeddings = createEmbeddings;
const hf_transformers_1 = require("@langchain/community/embeddings/hf_transformers");
function createEmbeddings() {
    return new hf_transformers_1.HuggingFaceTransformersEmbeddings({
        modelName: 'Xenova/all-MiniLM-L6-v2',
    });
}
