import { PrismaClient } from "@prisma/client";
import Papa from 'papaparse';
import axios from "axios";

const prisma = new PrismaClient();

const fetchData = async () => {
    return new Promise((resolve, reject) => {
        axios.get('https://www.kaggle.com/api/v1/datasets/download/chopper53/machine-learning-engineer-salary-in-2024/salaries.csv')
            .then(response => {
                const results = Papa.parse(response.data, { header: true,});
                //console.log(results.data[136]);
                resolve(results.data);
            })
            .catch(err => {
                reject(err);
            });
    });
}

// Insert data into database from fetched CSV file
const InsertData = async () => {
    const data = await fetchData();
    const slicedData = data.slice(0, 16494); // This will include data from index 0 to 16399
    const insertData = await prisma.engineers.createMany({
        data: slicedData
    });
}