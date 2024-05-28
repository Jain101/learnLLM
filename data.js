import { CSVLoader } from '@langchain/community/document_loaders/fs/csv'
import Papa from 'papaparse';

async function loadCSV() {
    const loader = new CSVLoader('salary.csv');
    const docs = await loader.load();
    //const docsText = JSON.stringify(docs);
    return docs
}

export { loadCSV }
