"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseSchema = exports.KnowledgeSuggestionSchema = exports.CitationSchema = void 0;
const zod_1 = require("zod");
exports.CitationSchema = zod_1.z.object({
    sourceDocument: zod_1.z.string().describe('The name of the source document'),
    pageNumber: zod_1.z.number().int().positive().describe('The page number in the document'),
    textSnippet: zod_1.z.string().describe('A direct quote from the source document'),
});
exports.KnowledgeSuggestionSchema = zod_1.z.object({
    id: zod_1.z.string().describe('Unique identifier for this suggestion'),
    title: zod_1.z.string().describe('Concise title summarizing the guidance'),
    summary: zod_1.z.string().describe('Detailed explanation of the policy guidance'),
    confidenceScore: zod_1.z.number().min(0).max(1).describe('Confidence score between 0 and 1 based on clarity of retrieved policy text'),
    relevanceLevel: zod_1.z.enum(['High', 'Medium', 'Low']).describe('How relevant this guidance is to the claim'),
    effectiveDate: zod_1.z.string().describe('When this policy became effective (ISO date or human-readable)'),
    documentType: zod_1.z.enum(['Policy', 'Regulation', 'SOP']).describe('Type of source document'),
    jurisdiction: zod_1.z.string().describe('Geographic or organizational jurisdiction'),
    citations: zod_1.z.array(exports.CitationSchema).min(1).describe('Source citations supporting this guidance'),
    actions: zod_1.z.array(zod_1.z.string()).optional().describe('Recommended operational actions when policy guidance implies decisions'),
});
exports.ResponseSchema = zod_1.z.object({
    suggestions: zod_1.z.array(exports.KnowledgeSuggestionSchema).describe('Array of knowledge suggestions'),
});
