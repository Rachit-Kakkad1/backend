"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAGRetriever = void 0;
const documents_1 = require("@langchain/core/documents");
class RAGRetriever {
    constructor(vectorStore, topK = 5) {
        this.vectorStore = vectorStore;
        this.topK = topK;
    }
    async retrieve(query, filters) {
        const results = await this.vectorStore.similaritySearch(query, this.topK);
        const typedDocs = results.map((doc) => new documents_1.Document({
            pageContent: doc.pageContent,
            metadata: doc.metadata,
        }));
        if (filters) {
            return typedDocs.filter((doc) => {
                const metadata = doc.metadata;
                if (filters.jurisdiction &&
                    !metadata.jurisdiction
                        .toLowerCase()
                        .includes(filters.jurisdiction.toLowerCase())) {
                    return false;
                }
                if (filters.documentType &&
                    metadata.documentType !== filters.documentType) {
                    return false;
                }
                return true;
            });
        }
        return typedDocs;
    }
}
exports.RAGRetriever = RAGRetriever;
