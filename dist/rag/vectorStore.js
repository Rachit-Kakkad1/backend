"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVectorStore = createVectorStore;
const memory_1 = require("langchain/vectorstores/memory");
async function createVectorStore(documents, embeddings) {
    console.log('Creating vector store...');
    if (documents.length === 0) {
        throw new Error('Cannot create vector store with zero documents');
    }
    const vectorStore = await memory_1.MemoryVectorStore.fromDocuments(documents, embeddings);
    console.log('Vector store created successfully');
    return vectorStore;
}
