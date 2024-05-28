import readline from "readline";

import { ChatOpenAI } from "@langchain/openai";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";

import { HumanMessage, AIMessage } from "@langchain/core/messages";

import { createOpenAIFunctionsAgent, AgentExecutor } from "langchain/agents";

// Tool imports
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { createRetrieverTool } from "langchain/tools/retriever";

// Custom Data Source, Vector Stores
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { loadCSV } from "./data.js";
import * as dotenv from 'dotenv';

dotenv.config();



const docs = await loadCSV();
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 10000,
    chunkOverlap: 100,
});
const splittedDocs = await splitter.splitDocuments(docs)
// console.log(splittedDocs);
const embeddings = new OpenAIEmbeddings();
const vectorStore = await MemoryVectorStore.fromDocuments(
    splittedDocs,
    embeddings,
);
const retriever = vectorStore.asRetriever({
    k: 2,
});

const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-3.5-turbo",
    temperature: 0.7
});

const prompt = ChatPromptTemplate.fromMessages([
    ('system', 'You are a data scientist. Analyze the given dataset and answer the user questions based on the given dataset.'),
    new MessagesPlaceholder("chat_history"),
    ('human', '{input}'),
    new MessagesPlaceholder("agent_scratchpad")
])

const searchTool = new TavilySearchResults();
const retrieverTool = createRetrieverTool(retriever, {
    name: "lcel_search",
    description:
        "Use this tool to search for relevant documents in the dataset, and analyse it as a data analyst",
});

const tools = [searchTool, retrieverTool];

const agent = await createOpenAIFunctionsAgent({
    llm: model,
    prompt,
    tools,
});

// Create the executor
const agentExecutor = new AgentExecutor({
    agent,
    tools,
});
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const chat_history = [];

function askQuestion() {
    rl.question("User: ", async (input) => {
        if (input.toLowerCase() === "exit") {
            rl.close();
            return;
        }
        const response = await agentExecutor.invoke({
            input: input,
            chat_history: chat_history,
        });
        console.log("Agent: ", response.output);

        chat_history.push(new HumanMessage(input));
        chat_history.push(new AIMessage(response.output));

        askQuestion();
    });
}

askQuestion();
