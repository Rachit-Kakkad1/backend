import { Router, Request, Response } from 'express';
import { RAGRetriever } from '../rag/retriever';
import { RAGGenerator } from '../rag/generator';

export function createSearchRouter(
  retriever: RAGRetriever,
  generator: RAGGenerator
): Router {
  const router = Router();

  router.post('/search', async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
      const { claimType, state } = req.body;

      if (!claimType || !state) {
        res.status(400).json({
          error: 'Missing required fields: claimType and state are required',
        });
        return;
      }

      // Build query for retrieval
      const queryText = `Claim type: ${claimType}. Jurisdiction: ${state}. What are the applicable policies, regulations, and procedures?`;

      // Retrieve relevant documents
      const retrievedDocs = await retriever.retrieve(queryText, {
        jurisdiction: state,
      });

      // Generate structured response
      const ragResponse = await generator.generate(
        { claimType, state },
        retrievedDocs
      );

      const retrievalTime = Date.now() - startTime;

      res.json({
        suggestions: ragResponse.suggestions,
        query: { claimType, state },
        retrievalTime,
      });

    } catch (error) {
      console.error('Search error:', error);
      
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  });

  return router;
}