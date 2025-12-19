import { z } from 'zod';

export const CitationSchema = z.object({
  sourceDocument: z.string().describe('The name of the source document'),
  pageNumber: z.number().int().positive().describe('The page number in the document'),
  textSnippet: z.string().describe('A direct quote from the source document'),
});

export const KnowledgeSuggestionSchema = z.object({
  id: z.string().describe('Unique identifier for this suggestion'),
  title: z.string().describe('Concise title summarizing the guidance'),
  summary: z.string().describe('Detailed explanation of the policy guidance'),
  confidenceScore: z.number().min(0).max(1).describe('Confidence score between 0 and 1 based on clarity of retrieved policy text'),
  relevanceLevel: z.enum(['High', 'Medium', 'Low']).describe('How relevant this guidance is to the claim'),
  effectiveDate: z.string().describe('When this policy became effective (ISO date or human-readable)'),
  documentType: z.enum(['Policy', 'Regulation', 'SOP']).describe('Type of source document'),
  jurisdiction: z.string().describe('Geographic or organizational jurisdiction'),
  citations: z.array(CitationSchema).min(1).describe('Source citations supporting this guidance'),
  actions: z.array(z.string()).optional().describe('Recommended operational actions when policy guidance implies decisions'),
});

export const ResponseSchema = z.object({
  suggestions: z.array(KnowledgeSuggestionSchema).describe('Array of knowledge suggestions'),
});

export type Citation = z.infer<typeof CitationSchema>;
export type KnowledgeSuggestion = z.infer<typeof KnowledgeSuggestionSchema>;
export type RAGResponse = z.infer<typeof ResponseSchema>;