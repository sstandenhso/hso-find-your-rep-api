/******************************************************
 * Function: updateEntityInJsonFile
 * Description: Updates an existing entity in a JSON file 
 * from the specified path and returns success or fail.  
 * Will fail if the entity to update does not exist.
 * Parameters:
 *   - entityID: string | number - ID of entity to be 
 * written to the JSON file.
 *  - Entity: any - The entity data to be updated
 *  in the JSON file.
 *   - filePath: string - The path to the JSON file to be read.
 * Returns: Success or fail message.
 * ***************************************************/

import { promises as fs } from 'fs';
import path from 'path';

/**
 * updateEntityInJsonFile(entityID, filePath, newEntity)
 * - Replaces the entity with `newEntity` but preserves the original ID.
 * - `newEntity` should contain the updated fields (excluding ID changes).
 */
export async function updateEntityInJsonFile(entityID: any, filePath: string, newEntity: Record<string, any>): Promise<{ ok: true; path: string } | never> {
    try {
        // compute absolute path for clarity in logs (don't change caller-supplied path behavior)
        const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

        // read existing content
        const data = await fs.readFile(filePath, 'utf-8');
        let parsed: any;
        try {
            parsed = JSON.parse(data);
        } catch (e) {
            // If file contains invalid JSON, throw
            throw e;
        }

        // Ensure the file holds an array
        if (!Array.isArray(parsed)) {
            throw new Error('JSON file does not contain an array of entities.');
        }

        // Find index of entity to update
        const index = parsed.findIndex((item: any) => item.ID === entityID);
        if (index === -1) {
            throw new Error(`Entity with ID ${entityID} not found.`);
        }

        // Replace the entity with the provided one, but force the ID to remain unchanged
        parsed[index] = {
            ...newEntity,
            ID: parsed[index].ID,
        };

        await fs.writeFile(filePath, JSON.stringify(parsed, null, 2), 'utf-8');
        return { ok: true, path: absolutePath };
    } catch (error) {
        throw error;
    }
}