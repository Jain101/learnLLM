//import { ChatOpenAI, OpenAI, OpenAIEmbeddings } from '@langchain/openai'
import {ChatGroq} from '@langchain/groq'
// import { ChatPromptTemplate } from "@langchain/core/prompts";
// import { StringOutputParser } from '@langchain/core/output_parsers'
// import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { SqlDatabase } from "langchain/sql_db";
import { createSqlAgent, SqlToolkit } from "langchain/agents/toolkits/sql";
// import { Prisma, PrismaClient } from '@prisma/client';
import { DataSource } from 'typeorm';

import * as dotenv from 'dotenv';


dotenv.config();

//const prisma = new PrismaClient();
const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "mixtral-8x7b-32768",
    temperature: 0.7,
    maxTokens: 1000,
});

async function main() {
    // //const db = await prisma.engineers.findMany();
    // //console.log(db[0]);
    // // const datasource = process.env.DATABASE_URL
    // // const db = await SqlDatabase.fromDataSourceParams({
    // //     appDataSource: datasource,
    // // });
    // // const datasource = new Client({
    // //     user: 'zaindb_owner',
    // //     host: 'ep-twilight-term-a5pp8abx.us-east-2.aws.neon.tech',
    // //     database: 'mitsqna',
    // //     password: 'gLujqVFy4bP1',
    // //     port: 5432,
    // //     ssl: {
    // //         rejectUnauthorized: false
    // //     }
    // // })
    // // datasource.connect()
    // // const datasource = new DataSource({
    // //     type: 'postgres',
    // //     database: 'mitsqna.db',
    // //     host: 'ep-twilight-term-a5pp8abx.us-east-2.aws.neon.tech',
    // //     port: 5432,
    // // });
    
    // const datasource = new DataSource({
    //     type: 'mysql',
    //     database: 'local instance mysql80',
    //     host: 'localhost',
    //     port: 3306,
    //     username: 'root',
    //     password: 'zain12345#',
    // })
    // const db = await SqlDatabase.fromDataSourceParams({
    //     appDataSource: datasource,
    //     // includesTables: ['engineers']
    // });
    const datasource = new DataSource({
        type: 'sqlite',
        database: './test.db',
    })
    const db = await SqlDatabase.fromDataSourceParams({
        appDataSource: datasource,
        includesTables: ['employees']
    });
    const toolkit = new SqlToolkit(db, model);
    const executor = createSqlAgent(model, toolkit,{topK:16494});
    //const input = `how many rows are there in the dataset?`;
    const input = `what is the  average salary for the year 2020 in the dataset?`;
    console.log(`Executing with input "${input}"...`);
    const result = await executor.invoke({ input });
    console.log(`Got output ${result.output}`);
    console.log(
        `Got intermediate steps ${JSON.stringify(
            result.intermediateSteps,
            null,
            2
        )}`
    );
}
main()
