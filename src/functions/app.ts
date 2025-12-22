// src/functions/app.ts
import { app } from '@azure/functions';

// Import your individual function logic
import { salesRepApi } from '../api/read/salesRepApi';
import { searchApi } from '../api/read/searchByZip';
import { searchByStateAPI } from '../api/read/searchByStateAPI';
import { getRepsAPI } from '../api/read/getRepsAPI';

console.log("DEBUG: app.ts - Starting function registration.");
// app.http('salesRepApi', {
//     methods: ['GET', 'POST'], // Keep methods as you need them
//     authLevel: 'anonymous',
//     handler: salesRepApi,
//     route: 'sales-rep' // <-- ADDED THIS LINE
// });
// console.log("DEBUG: app.ts - salesRepApi registered.");

// app.http('searchApi', {
//     methods: ['GET', 'POST'], // Keep methods as you need them
//     authLevel: 'anonymous',
//     handler: searchApi,
//     route: 'search' // <-- ADDED THIS LINE
// });
// console.log("DEBUG: app.ts - searchApi registered.");

app.http('getRepsAPI', {
    methods: ['GET', 'POST'], // Keep methods as you need them
    authLevel: 'anonymous',
    handler: getRepsAPI,
    route: 'sales-reps' // <-- ADDED THIS LINE
});
console.log("DEBUG: app.ts - getRepsAPI registered.");

app.http('searchByStateAPI', {
    methods: ['GET', 'POST'], // Keep methods as you need them
    authLevel: 'anonymous',
    handler: searchByStateAPI,
    route: 'states/get-reps' // <-- ADDED THIS LINE
});
console.log("DEBUG: app.ts - searchByStateAPI registered.");

console.log("DEBUG: app.ts - All functions processed.");