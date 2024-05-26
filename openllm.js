import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from '@langchain/core/output_parsers'
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval"
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import * as dotenv from 'dotenv';
import { loadCSV } from './data.js';

dotenv.config();
const docs = await loadCSV();

async function runModel() {
    // model
    const model = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        model: "gpt-3.5-turbo",
        temperature: 0.8
    });
    // prompt
    const prompt = ChatPromptTemplate.fromTemplate(`
        You are an ML engineer. Analyse the given dataset and Answer the user's question based on the given dataset. 
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
        chunkSize: 1000,
        chunkOverlap: 20,
    });
    const splitDocs = await splitter.splitDocuments(docs)
    // vector store 
    // store
    const embeddings = new OpenAIEmbeddings();
    const vectorStore = await MemoryVectorStore.fromDocuments(
        splitDocs,
        embeddings,
    );
    // retrieve
    const retriever = vectorStore.asRetriever({
        k: 3,
    })
    const retrievalChain = await createRetrievalChain({
        combineDocsChain: chain,
        retriever,
    })
    // response
    const response = await retrievalChain.invoke({
        input: "what are the total jobs in 2020?",
        context: docs
    });
    console.log(response);
}
runModel()
