// Imports for Azure Functions, HTTP types, and Blob Storage
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";
// Assuming you have a types/types.ts file in your functions project as well,
// or you can define these types directly in this file if they're only used here.
import { State, DataError } from "../../types/types"; // Adjust path as needed

// --- Configuration for Blob Storage ---
// These will be pulled from Application Settings in your Azure Function App
const BLOB_CONNECTION_STRING_NAME = "AzureWebJobsStorage"; // Default connection string key for Functions
const BLOB_CONTAINER_NAME = process.env.BLOB_CONTAINER_NAME || "hso_storage_blob"; // Set in Function App settings
const BLOB_FILE_NAME = process.env.STATES_BLOB_FILE_NAME || "states.json"; // Set in Function App settings

// --- In-memory cache for the JSON data ---
// This will store the data after the first successful read from Blob Storage
let cachedStateData: State[] | null = null;

// --- Helper function to load data from Blob Storage ---
async function loadDataFromBlob(context: InvocationContext): Promise<State[]> {
    if (cachedStateData) {
        context.log("Using cached data.");
        return cachedStateData;
    }

    context.log("Loading data from Blob Storage...");
    try {
        const connectionString = process.env[BLOB_CONNECTION_STRING_NAME];
        if (!connectionString) {
            throw new Error(`Azure Storage Connection String '${BLOB_CONNECTION_STRING_NAME}' not found in environment variables.`);
        }

        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(BLOB_CONTAINER_NAME);
        const blockBlobClient = containerClient.getBlockBlobClient(BLOB_FILE_NAME);

        const downloadResponse = await blockBlobClient.download(0); // Start from beginning
        if (!downloadResponse.readableStreamBody) {
            throw new Error("Blob stream is not readable.");
        }

        const readableStream = downloadResponse.readableStreamBody;
        let data = "";
        for await (const chunk of readableStream) {
            data += chunk.toString();
        }

        const parsedData: State[] = JSON.parse(data);
        cachedStateData = parsedData; // Cache the data
        context.log("Data loaded and cached from Blob Storage successfully.");
        return parsedData;

    } catch (error) {
        console.error("Error loading data from Blob Storage:", error);
        throw new Error("Failed to load data from Blob Storage.");
    }
}

export async function searchByStateAPI(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    // ... (rest of your handler logic) ...

    // --- 1. Extract stateAbbreviation from query parameters ---
    // In Azure Functions, query parameters are accessed via request.query.get()
    const stateAbbreviationQueryParam = request.query.get('stateAbbreviation');

    let statesToSearch: string[] = [];

    if (typeof stateAbbreviationQueryParam === "string") {
        statesToSearch = stateAbbreviationQueryParam.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
    // Note: Azure Functions' request.query.get() typically returns a single string,
    // even if the original URL had multiple query params with the same name.
    // If you expect `zipCode=123,456` this will work.
    // If you expect `zipCode=123&zipCode=456`, you'd need to use a different method
    // (e.g., request.query.getAll('zipCode')), but your Next.js code handles comma-separated.

    if (statesToSearch.length === 0) {
        return {
            status: 400,
            jsonBody: { error: "No valid states provided for search." } as DataError,
            headers: { 'Content-Type': 'application/json' }
        };
    }

    try {
        // --- 2. Load the JSON data (from cache or Blob Storage) ---
        const jsonData = await loadDataFromBlob(context);

        const foundTerritories: string[] = [];

        // --- 3. Iterate and find matching territories ---
        statesToSearch.forEach(searchState => {
            const matches = jsonData.filter(item => item.stateAbbreviation === searchState);
            matches.forEach(match => {
                if (!foundTerritories.includes(match.salesRep)) {
                    foundTerritories.push(match.salesRep);
                }
                if (!foundTerritories.includes(match.supportRep)) {
                    foundTerritories.push(match.supportRep);
                }
                if (!foundTerritories.includes(match.productRep)) {
                    foundTerritories.push(match.productRep);
                }
                if (!foundTerritories.includes(match.groupPracticeRep)) {
                    foundTerritories.push(match.groupPracticeRep);
                }
            });
        });

        if (foundTerritories.length === 0) {
            return {
                status: 404,
                jsonBody: { error: "No territories found for the provided states." } as DataError,
                headers: { 'Content-Type': 'application/json' }
            };
        }

        foundTerritories.sort(); // Sorts strings alphabetically

        // --- 4. Return successful response ---
        return {
            status: 200,
            jsonBody: foundTerritories,
            headers: { 'Content-Type': 'application/json' }
        };

    } catch (error) {
        console.error("Error in searchByStateAPI function:", error);

        // Check if the error is from JSON parsing during data load
        if (error instanceof SyntaxError) {
            return {
                status: 500,
                jsonBody: { error: "Failed to parse the JSON file (invalid format)." } as DataError,
                headers: { 'Content-Type': 'application/json' }
            };
        }
        return {
            status: 500,
            jsonBody: { error: "An unexpected error occurred while processing your request." } as DataError,
            headers: { 'Content-Type': 'application/json' }
        };
    }
}