import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DocumentLoader } from './ingestion/documentLoader';
import { createEmbeddings } from './rag/embeddings';
import { createVectorStore } from './rag/vectorStore';
import { RAGRetriever } from './rag/retriever';
import { RAGGenerator } from './rag/generator';
import { createSearchRouter } from './api/search.route';

dotenv.config();

async function startServer() {
  try {
    console.log('='.repeat(60));
    console.log('INSURANCE RAG SYSTEM - STARTING (DeepSeek)');
    console.log('='.repeat(60));

    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY must be set in environment');
    }

    const documentsPath = process.env.DOCUMENTS_PATH || './documents';
    const port = parseInt(process.env.PORT || '3001', 10);

    console.log('\n[1/5] Loading documents...');
    const loader = new DocumentLoader(documentsPath);
    const documents = loader.loadDocuments();

    console.log('\n[2/5] Initializing embeddings (Local HuggingFace)...');
    const embeddings = createEmbeddings();

    console.log('\n[3/5] Building vector store...');
    const vectorStore = await createVectorStore(documents, embeddings);

    console.log('\n[4/5] Initializing RAG pipeline (DeepSeek LLM)...');
    const retriever = new RAGRetriever(vectorStore, 5);
    const generator = new RAGGenerator();

    console.log('\n[5/5] Starting API server...');
    const app = express();
    app.use(cors());
    app.use(express.json());

    app.get('/health', (_req, res) => {
      res.json({
        status: 'healthy',
        llm: 'DeepSeek',
        embeddings: 'Local (HuggingFace)',
        documentsLoaded: documents.length,
        timestamp: new Date().toISOString(),
      });
    });

    app.use('/api', createSearchRouter(retriever, generator));

    app.listen(port, () => {
      console.log('\n' + '='.repeat(60));
      console.log('✓ SERVER READY');
      console.log(`API: http://localhost:${port}`);
      console.log(`Health: http://localhost:${port}/health`);
      console.log(`LLM: DeepSeek`);
      console.log(`Embeddings: Local HuggingFace`);
      console.log(`Documents loaded: ${documents.length}`);
      console.log('='.repeat(60));
    });

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('✗ FATAL ERROR - SERVER CANNOT START');
    console.error('='.repeat(60));
    console.error(error);
    console.error('='.repeat(60));
    process.exit(1);
  }
}

startServer();
