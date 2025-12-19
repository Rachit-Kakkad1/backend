import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from 'langchain/document';
import { Embeddings } from '@langchain/core/embeddings';
import { DocumentMetadata } from '../ingestion/documentLoader';

export async function createVectorStore(
  documents: Document<DocumentMetadata>[],
  embeddings: Embeddings
): Promise<MemoryVectorStore> {
  console.log('Creating vector store...');
  
  if (documents.length === 0) {
    throw new Error('Cannot create vector store with zero documents');
  }

  const vectorStore = await MemoryVectorStore.fromDocuments(
    documents,
    embeddings
  );

  console.log('Vector store created successfully');
  return vectorStore;
}