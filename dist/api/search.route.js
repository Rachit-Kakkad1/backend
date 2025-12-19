"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSearchRouter = createSearchRouter;
const express_1 = require("express");
function createSearchRouter(retriever, generator) {
    const router = (0, express_1.Router)();
    router.post('/search', async (req, res) => {
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
            const ragResponse = await generator.generate({ claimType, state }, retrievedDocs);
            const retrievalTime = Date.now() - startTime;
            res.json({
                suggestions: ragResponse.suggestions,
                query: { claimType, state },
                retrievalTime,
            });
        }
        catch (error) {
            console.error('Search error:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Internal server error',
            });
        }
    });
    return router;
}
