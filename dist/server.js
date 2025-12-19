"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const documentLoader_1 = require("./ingestion/documentLoader");
const embeddings_1 = require("./rag/embeddings");
const vectorStore_1 = require("./rag/vectorStore");
const retriever_1 = require("./rag/retriever");
const generator_1 = require("./rag/generator");
const search_route_1 = require("./api/search.route");
dotenv_1.default.config();
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
        const loader = new documentLoader_1.DocumentLoader(documentsPath);
        const documents = loader.loadDocuments();
        console.log('\n[2/5] Initializing embeddings (Local HuggingFace)...');
        const embeddings = (0, embeddings_1.createEmbeddings)();
        console.log('\n[3/5] Building vector store...');
        const vectorStore = await (0, vectorStore_1.createVectorStore)(documents, embeddings);
        console.log('\n[4/5] Initializing RAG pipeline (DeepSeek LLM)...');
        const retriever = new retriever_1.RAGRetriever(vectorStore, 5);
        const generator = new generator_1.RAGGenerator();
        console.log('\n[5/5] Starting API server...');
        const app = (0, express_1.default)();
        app.use((0, cors_1.default)());
        app.use(express_1.default.json());
        app.get('/health', (_req, res) => {
            res.json({
                status: 'healthy',
                llm: 'DeepSeek',
                embeddings: 'Local (HuggingFace)',
                documentsLoaded: documents.length,
                timestamp: new Date().toISOString(),
            });
        });
        app.use('/api', (0, search_route_1.createSearchRouter)(retriever, generator));
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
    }
    catch (error) {
        console.error('\n' + '='.repeat(60));
        console.error('✗ FATAL ERROR - SERVER CANNOT START');
        console.error('='.repeat(60));
        console.error(error);
        console.error('='.repeat(60));
        process.exit(1);
    }
}
startServer();
