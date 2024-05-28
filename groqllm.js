import { ChatGroq } from '@langchain/groq'
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from '@langchain/core/output_parsers'
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import {createRetrievalChain}  from "langchain/chains/retrieval"
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import * as dotenv from 'dotenv';
import { loadCSV } from './data.js';

dotenv.config();
const docs = await loadCSV();

async function runModel() {
    // model
    const model = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: "mixtral-8x7b-32768",
        temperature: 0.8
    });
    const modelEmbedding = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_API_KEY,
        modelName: "embedding-001",
    });
    // prompt
    const prompt = ChatPromptTemplate.fromTemplate(`
        You are an ML engineer. Analyse the given dataset and Answer the user's question based on the given dataset. 
        When asked about totals, sum up the relevant numbers. When asked about averages, calculate the average based on the provided numbers. Provide a detailed answer explaining your steps.
        context : {context}
        input: {input}
    `)
    // output parser
    const parser = new StringOutputParser();
    // chain
    const chain = await createStuffDocumentsChain({
        llm: model,
        prompt: prompt,
        outputParser: parser
    })
    // split docs
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 2000,
        chunkOverlap: 100,
    });
    const splitDocs = await splitter.splitDocuments(docs)
    // embed docs
    const embedDocs = await modelEmbedding.embedDocuments(splitDocs);
    // vector store - store and retrieve
    const vectorStore = new MemoryVectorStore({
        embedDocs,
        modelEmbedding,
    });
    const retriever = vectorStore.asRetriever({
        k: 4
    })
    const retrievalChain = await createRetrievalChain({
        retriever,
        combineDocsChain: chain,
    })
    // response
    const response = await retrievalChain.invoke({
        input: "what are the total number of jobs for the year 2020?",
    });
    console.log(response);
}
runModel()
