import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";
import { v4 as uuidv4 } from "uuid";
import { ResponseSchema } from "./schemas";
import { DocumentMetadata } from "../ingestion/documentLoader";

export class RAGGenerator {
  private llm: ChatOpenAI;
  private parser: StructuredOutputParser<any>;

  constructor() {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY is required");
    }

    this.llm = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "deepseek-chat",
      temperature: 0.1,
      configuration: {
        baseURL: "https://api.deepseek.com/v1",
      },
    });

    this.parser = StructuredOutputParser.fromZodSchema(ResponseSchema);
  }

  async generate(
    query: { claimType: string; state: string },
    retrievedDocs: Document<DocumentMetadata>[]
  ) {
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

    const prompt = PromptTemplate.fromTemplate(`
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

    const parsed = await this.parser.parse(
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content)
    );

    parsed.suggestions = parsed.suggestions.map((s: any) => ({
      ...s,
      id: s.id || uuidv4(),
    }));

    return parsed;
  }
}
