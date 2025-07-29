// Imports for Azure Functions, HTTP types, and Blob Storage
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";
// Assuming you have a types/types.ts file in your functions project as well
import { SalesRepData, DataError } from "../types/types"; // Adjust path as needed

// --- Configuration for Blob Storage ---
// These will be pulled from Application Settings in your Azure Function App
const BLOB_CONNECTION_STRING_NAME = "AzureWebJobsStorage"; // Default connection string key for Functions
const BLOB_CONTAINER_NAME = process.env.BLOB_CONTAINER_NAME || "your-default-container-name"; // Set in Function App settings
const SALES_REPS_BLOB_FILE_NAME = process.env.SALES_REPS_BLOB_FILE_NAME || "salesReps.json"; // Specific file name for sales reps data

// --- In-memory cache for the JSON data ---
// This will store the data after the first successful read from Blob Storage
let cachedSalesRepData: SalesRepData[] | null = null;

// --- Helper function to load Sales Rep data from Blob Storage ---
async function loadSalesRepDataFromBlob(context: InvocationContext): Promise<SalesRepData[]> {
    if (cachedSalesRepData) {
        context.log("Using cached sales rep data.");
        return cachedSalesRepData;
    }

    context.log("Loading sales rep data from Blob Storage...");
    try {
        const connectionString = process.env[BLOB_CONNECTION_STRING_NAME];
        if (!connectionString) {
            throw new Error(`Azure Storage Connection String '${BLOB_CONNECTION_STRING_NAME}' not found in environment variables.`);
        }

        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(BLOB_CONTAINER_NAME);
        const blockBlobClient = containerClient.getBlockBlobClient(SALES_REPS_BLOB_FILE_NAME);

        const downloadResponse = await blockBlobClient.download(0); // Start from beginning
        if (!downloadResponse.readableStreamBody) {
            throw new Error("Blob stream is not readable.");
        }

        const readableStream = downloadResponse.readableStreamBody;
        let data = "";
        for await (const chunk of readableStream) {
            data += chunk.toString();
        }

        const parsedData: SalesRepData[] = JSON.parse(data);
        cachedSalesRepData = parsedData; // Cache the data
        context.log("Sales rep data loaded and cached from Blob Storage successfully.");
        return parsedData;

    } catch (error) {
        // Using console.error due to previous linting issue with context.log.error
        console.error("Error loading sales rep data from Blob Storage:", error);
        throw new Error("Failed to load sales representative data from Blob Storage.");
    }
}


// --- Main Azure Function Handler ---
export async function salesRepApi(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        // Load the JSON data (from cache or Blob Storage)
        const jsonData = await loadSalesRepDataFromBlob(context);

        // Return successful response
        return {
            status: 200,
            jsonBody: jsonData,
            headers: { 'Content-Type': 'application/json' }
        };

    } catch (error) {
        // Using console.error due to previous linting issue with context.log.error
        console.error("Error in salesRepApi function:", error);

        // Check if the error is from JSON parsing during data load
        if (error instanceof SyntaxError) {
            return {
                status: 500,
                jsonBody: { error: "Failed to parse the sales representative JSON file (invalid format)." } as DataError,
                headers: { 'Content-Type': 'application/json' }
            };
        }
        // Generic error for file read or other unexpected issues
        return {
            status: 500,
            jsonBody: { error: "An unexpected error occurred while loading sales representative data." } as DataError,
            headers: { 'Content-Type': 'application/json' }
        };
    }
}

// --- Register the HTTP function with the Azure Functions App ---
app.http('salesRepApi', {
    methods: ['GET'], // This is a GET endpoint for data retrieval
    authLevel: 'anonymous', // Publicly accessible
    handler: salesRepApi,
    route: 'sales-rep' // This makes the endpoint accessible at /api/sales-rep
});