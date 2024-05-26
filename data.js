import { CSVLoader } from '@langchain/community/document_loaders/fs/csv'

async function loadCSV() {
    const loader = new CSVLoader('salaries.csv');
    const docs = await loader.load();
    return docs
}

export { loadCSV }
