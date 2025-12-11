/******************************************************
 * Function: writeToJsonFile
 * Description: Writes a new entity to a JSON file 
 * from the specified path and returns success or fail.  
 * Will create the file if it does not exist.
 * Parameters:
 *   - entity: any - The entity to be written to the JSON file.
 *   - filePath: string - The path to the JSON file to be read.
 * Returns: Success or fail message.
 * ***************************************************/

import { promises as fs } from 'fs';
import path from 'path';

export async function writeToJsonFile(entity: any, filePath: string): Promise<{ ok: true; path: string } | never> {
    try {
        // compute absolute path for clarity in logs (don't change caller-supplied path behavior)
        const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

        // if file doesn't exist, create it with an empty array
        if (!(await fs.stat(filePath).catch(() => false))) {
            await fs.writeFile(filePath, JSON.stringify([], null, 2), 'utf-8');
        }

        // read existing content
        const data = await fs.readFile(filePath, 'utf-8');
        let parsed: any;
        try {
            parsed = JSON.parse(data);
        } catch (e) {
            // If file contains invalid JSON, throw
            throw e;
        }

        // If the file holds an array, append the entity; otherwise, create an array containing both
        let newContent;
        if (Array.isArray(parsed)) {
            newContent = [...parsed, entity];
        } else if (parsed && typeof parsed === 'object') {
            newContent = [parsed, entity];
        } else {
            newContent = [entity];
        }

        await fs.writeFile(filePath, JSON.stringify(newContent, null, 2), 'utf-8');
        return { ok: true, path: absolutePath };
    } catch (error) {
        throw error;
    }
}