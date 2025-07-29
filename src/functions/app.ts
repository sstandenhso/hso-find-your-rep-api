// src/functions/app.ts
import { app } from '@azure/functions';

// Import your individual function logic
import { salesRepApi } from './salesRepApi';
import { searchApi } from './searchApi';

console.log("DEBUG: app.ts - Starting function registration."); // ADD THIS
app.http('salesRepApi', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: salesRepApi
});
console.log("DEBUG: app.ts - salesRepApi registered."); // ADD THIS

app.http('searchApi', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: searchApi
});
console.log("DEBUG: app.ts - searchApi registered."); // ADD THIS

console.log("DEBUG: app.ts - All functions processed."); // ADD THIS