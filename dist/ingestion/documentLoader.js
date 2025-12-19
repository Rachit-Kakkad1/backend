"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentLoader = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const document_1 = require("langchain/document");
class DocumentLoader {
    constructor(documentsPath) {
        this.documentsPath = documentsPath;
        if (!(0, fs_1.existsSync)(this.documentsPath)) {
            throw new Error(`Documents path does not exist: ${this.documentsPath}. ` +
                `Please create this directory and add policy documents.`);
        }
    }
    loadDocuments() {
        const documents = [];
        const files = this.getTextFiles(this.documentsPath);
        if (files.length === 0) {
            throw new Error(`No text files found in ${this.documentsPath}. ` +
                `Please add .txt policy documents to proceed.`);
        }
        console.log(`Found ${files.length} document(s) to load`);
        for (const filePath of files) {
            try {
                const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
                const fileName = filePath.split('/').pop() || filePath;
                // Parse metadata from filename or content
                const metadata = this.extractMetadata(fileName, content);
                // Split into chunks (simple paragraph-based splitting)
                const chunks = this.chunkDocument(content);
                chunks.forEach((chunk, index) => {
                    documents.push(new document_1.Document({
                        pageContent: chunk,
                        metadata: {
                            ...metadata,
                            source: fileName,
                            page: index + 1,
                        },
                    }));
                });
                console.log(`Loaded: ${fileName} (${chunks.length} chunks)`);
            }
            catch (error) {
                console.error(`Failed to load ${filePath}:`, error);
                throw error;
            }
        }
        if (documents.length === 0) {
            throw new Error('No documents were successfully loaded. Server cannot start.');
        }
        console.log(`Total chunks loaded: ${documents.length}`);
        return documents;
    }
    getTextFiles(dir) {
        const files = [];
        const entries = (0, fs_1.readdirSync)(dir);
        for (const entry of entries) {
            const fullPath = (0, path_1.join)(dir, entry);
            const stat = (0, fs_1.statSync)(fullPath);
            if (stat.isDirectory()) {
                files.push(...this.getTextFiles(fullPath));
            }
            else if (entry.endsWith('.txt')) {
                files.push(fullPath);
            }
        }
        return files;
    }
    extractMetadata(fileName, content) {
        // Try to extract metadata from filename pattern:
        // Example: "policy_california_2024-01-01.txt"
        const fileNameLower = fileName.toLowerCase();
        let jurisdiction = 'General';
        let effectiveDate = new Date().toISOString().split('T')[0];
        let documentType = 'Policy';
        // Extract jurisdiction from filename
        const states = ['california', 'texas', 'florida', 'new york', 'illinois'];
        for (const state of states) {
            if (fileNameLower.includes(state)) {
                jurisdiction = state.charAt(0).toUpperCase() + state.slice(1);
                break;
            }
        }
        // Extract date (YYYY-MM-DD pattern)
        const dateMatch = fileName.match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
            effectiveDate = dateMatch[1];
        }
        // Determine document type
        if (fileNameLower.includes('regulation')) {
            documentType = 'Regulation';
        }
        else if (fileNameLower.includes('sop')) {
            documentType = 'SOP';
        }
        // Try to extract from content headers
        const contentLines = content.split('\n').slice(0, 20);
        for (const line of contentLines) {
            if (line.toLowerCase().includes('jurisdiction:')) {
                jurisdiction = line.split(':')[1]?.trim() || jurisdiction;
            }
            if (line.toLowerCase().includes('effective date:')) {
                effectiveDate = line.split(':')[1]?.trim() || effectiveDate;
            }
        }
        return { jurisdiction, effectiveDate, documentType };
    }
    chunkDocument(content) {
        // Split by double newlines (paragraphs) or every ~500 chars
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
        const chunks = [];
        let currentChunk = '';
        for (const paragraph of paragraphs) {
            if (currentChunk.length + paragraph.length > 1000 && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = paragraph;
            }
            else {
                currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
            }
        }
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }
        return chunks.length > 0 ? chunks : [content];
    }
}
exports.DocumentLoader = DocumentLoader;
