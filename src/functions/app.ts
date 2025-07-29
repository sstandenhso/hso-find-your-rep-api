// src/functions/app.ts
import { app } from '@azure/functions';

// Import your individual function logic
import { salesRepApi } from './salesRepApi'; // Assuming salesRepApi.ts exports a named function 'salesRepApi'
import { searchApi } from './searchApi'; // Assuming searchApi.ts exports a named function 'searchApi'

// Register your functions with the app object
// Assuming salesRepApi is an HTTP trigger, adjust methods/authLevel as needed
app.http('salesRepApi', {
    methods: ['GET', 'POST'], // Adjust methods based on your function
    authLevel: 'anonymous', // Adjust authLevel (function, anonymous, admin)
    handler: salesRepApi // Your function handler from salesRepApi.ts
});

// Assuming searchApi is an HTTP trigger
app.http('searchApi', {
    methods: ['GET', 'POST'], // Adjust methods based on your function
    authLevel: 'anonymous',
    handler: searchApi // Your function handler from searchApi.ts
});

// You might also have a default export if your salesRepApi or searchApi were default exports.
// Example if salesRepApi.ts was 'export default async function salesRepApi(...)'
// import salesRepApiDefault from './salesRepApi';
// app.http('salesRepApi', { methods: ['GET', 'POST'], handler: salesRepApiDefault });