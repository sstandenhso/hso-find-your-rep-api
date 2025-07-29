// src/functions/app.ts
import { app } from '@azure/functions';

// Import your individual function logic
import { salesRepApi } from './salesRepApi';
import { searchApi } from './searchApi';

console.log("DEBUG: app.ts - Starting function registration.");
app.http('salesRepApi', {
    methods: ['GET', 'POST'], // Keep methods as you need them
    authLevel: 'anonymous',
    handler: salesRepApi,
    route: 'sales-rep' // <-- ADDED THIS LINE
});
console.log("DEBUG: app.ts - salesRepApi registered.");

app.http('searchApi', {
    methods: ['GET', 'POST'], // Keep methods as you need them
    authLevel: 'anonymous',
    handler: searchApi,
    route: 'search' // <-- ADDED THIS LINE
});
console.log("DEBUG: app.ts - searchApi registered.");

console.log("DEBUG: app.ts - All functions processed.");