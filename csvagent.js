import { OpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import * as fs from "fs";
import {
    VectorStoreToolkit,
    createVectorStoreAgent,
} from "langchain/agents";
import * as dotenv from "dotenv";
import { loadCSV } from "./data.js";
dotenv.config();

const model = new OpenAI({ temperature: 0 });
const docs = await loadCSV();
/* Load in the file we want to do question answering over */
// const text = fs.readFileSync("state_of_the_union.txt", "utf8");
// /* Split the text into chunks using character, not token, size */
// const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
// const docs = await textSplitter.createDocuments([text]);
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
/* Create the vectorstore */
const vectorStore = await HNSWLib.fromDocuments(splittedDocs, embeddings);

/* Create the agent */
const vectorStoreInfo = {
    name: "state_of_union_address",
    description: "the most recent state of the Union address",
    vectorStore,
};

const toolkit = new VectorStoreToolkit(vectorStoreInfo, model);
const agent = createVectorStoreAgent(model, toolkit);

const input =
    "What did biden say about Ketanji Brown Jackson is the state of the union address?";
console.log(`Executing: ${input}`);

const result = await agent.invoke({ input });
console.log(`Got output ${result.output}`);
console.log(
    `Got intermediate steps ${JSON.stringify(result.intermediateSteps, null, 2)}`
);