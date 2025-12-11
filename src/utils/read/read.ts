/******************************************************
 * Function: readJsonFile
 * Description: Reads a JSON file from the specified path and returns its contents as a JavaScript object.
 * Parameters:
 *   - filePath: string - The path to the JSON file to be read.
 * Returns: Promise<any> - A promise that resolves to the parsed JSON object.
 * ***************************************************/

import { promises as fs } from 'fs';

export async function readJsonFile(filePath: string): Promise<any> {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        throw error;
    }
}