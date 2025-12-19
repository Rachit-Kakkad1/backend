"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAGGenerator = void 0;
const openai_1 = require("@langchain/openai");
const output_parsers_1 = require("@langchain/core/output_parsers");
const prompts_1 = require("@langchain/core/prompts");
const uuid_1 = require("uuid");
const schemas_1 = require("./schemas");
class RAGGenerator {
    constructor() {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            throw new Error("DEEPSEEK_API_KEY is required");
        }
        this.llm = new openai_1.ChatOpenAI({
            openAIApiKey: apiKey,
            modelName: "deepseek-chat",
            temperature: 0.1,
            configuration: {
                baseURL: "https://api.deepseek.com/v1",
            },
        });
        this.parser = output_parsers_1.StructuredOutputParser.fromZodSchema(schemas_1.ResponseSchema);
    }
    async generate(query, retrievedDocs) {
        if (retrievedDocs.length === 0) {
            return { suggestions: [] };
        }
        const formatInstructions = this.parser.getFormatInstructions();
        const context = retrievedDocs
            .map((doc, idx) => {
            const meta = doc.metadata;
            return `[Document ${idx + 1}]
Source: ${meta.source}
Page: ${meta.page}
Type: ${meta.documentType}
Jurisdiction: ${meta.jurisdiction}
Effective Date: ${meta.effectiveDate}
Content: ${doc.pageContent}`;
        })
            .join("\n---\n");
        const prompt = prompts_1.PromptTemplate.fromTemplate(`
You are an insurance policy expert.

CLAIM QUERY:
Claim Type: {claimType}
State/Jurisdiction: {state}

POLICY DOCUMENTS:
{context}

{format_instructions}
`);
        const input = await prompt.format({
            claimType: query.claimType,
            state: query.state,
            context,
            format_instructions: formatInstructions,
        });
        const response = await this.llm.invoke(input);
        const parsed = await this.parser.parse(typeof response.content === "string"
            ? response.content
            : JSON.stringify(response.content));
        parsed.suggestions = parsed.suggestions.map((s) => ({
            ...s,
            id: s.id || (0, uuid_1.v4)(),
        }));
        return parsed;
    }
}
exports.RAGGenerator = RAGGenerator;
