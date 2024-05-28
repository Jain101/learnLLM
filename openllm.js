import { ChatOpenAI, OpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from '@langchain/core/output_parsers'
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval"
// import {vec} from "langchain/chains"
import { MemoryVectorStore } from "langchain/vectorstores/memory";
// import { HNSWLib } from "langchain/vectorstores/hnswlib";
import * as dotenv from 'dotenv';
import { loadCSV } from './data.js';

dotenv.config();

// model
const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-3.5-turbo",
    temperature: 0.7
});
// prompt
const prompt = ChatPromptTemplate.fromTemplate(`
    You are an ML engineer. Analyse the given dataset and Answer the user's question based on the given dataset. 
    context : {context}
    input: {input}
`)
// output parser
// const parser = new StringOutputParser();
// chain
const chain = await createStuffDocumentsChain({
    llm: model,
    prompt: prompt,
    verbose: true,
    // outputParser: parser
})

// async function loadAndFormatCSV(filePath) {
//     const docs = await loadCSV(filePath);
//     return docs.map(row => {
//         let formattedRow = "";
//         for (const [key, value] of Object.entries(row)) {
//             formattedRow += `${key}: ${value}\n`;
//         }
//         return { formattedRow };
//     });
// }
async function setupRetrievalChain(docs) {
    // split docs
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 10000,
        chunkOverlap: 100,
    });
    //console.log(splitter);
    const splittedDocs = await splitter.splitDocuments(docs)
    //console.log(splittedDocs);
    // vector store 
    // store
    const embeddings = new OpenAIEmbeddings();
    const vectorStore = await MemoryVectorStore.fromDocuments(
        splittedDocs,
        embeddings,
    );
    // retrieve
    const retriever = vectorStore.asRetriever({
        k: 2,
    })
    //console.log(retriever);
    const retrievalChain = await createRetrievalChain({
        retriever,
        combineDocsChain: chain,
    })
    //const retrievalChain = RetrievalQAChain.fromLLM()
    return retrievalChain
}
async function main() {
    const docs = await loadCSV();
    //console.log(docs);
    const chain = await setupRetrievalChain(docs)
    const query = "How many rows are there in the dataset?";
    const response = await chain.invoke({
        input: query,
        context: docs
    });
    console.log(response);
}
main()
