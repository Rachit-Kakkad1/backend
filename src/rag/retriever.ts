import { VectorStore } from "@langchain/core/vectorstores";
import { Document } from "@langchain/core/documents";
import { DocumentMetadata } from "../ingestion/documentLoader";

export class RAGRetriever {
  private vectorStore: VectorStore;
  private topK: number;

  constructor(vectorStore: VectorStore, topK: number = 5) {
    this.vectorStore = vectorStore;
    this.topK = topK;
  }

  async retrieve(
    query: string,
    filters?: Partial<DocumentMetadata>
  ): Promise<Document<DocumentMetadata>[]> {
    const results = await this.vectorStore.similaritySearch(query, this.topK);

    const typedDocs: Document<DocumentMetadata>[] = results.map(
      (doc) =>
        new Document<DocumentMetadata>({
          pageContent: doc.pageContent,
          metadata: doc.metadata as DocumentMetadata,
        })
    );

    if (filters) {
      return typedDocs.filter((doc) => {
        const metadata = doc.metadata;

        if (
          filters.jurisdiction &&
          !metadata.jurisdiction
            .toLowerCase()
            .includes(filters.jurisdiction.toLowerCase())
        ) {
          return false;
        }

        if (
          filters.documentType &&
          metadata.documentType !== filters.documentType
        ) {
          return false;
        }

        return true;
      });
    }

    return typedDocs;
  }
}
