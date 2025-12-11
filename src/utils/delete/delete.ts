/******************************************************
 * Function: deleteEntityInJsonFile
 * Description: Deletes an existing entity in a JSON file 
 * from the specified path and returns success or fail.  
 * Will fail if the entity to delete does not exist.
 * Parameters:
 *   - entityID: string | number - ID of entity to be 
 * deleted in the JSON file.
 *   - filePath: string - The path to the JSON file to 
 * be read.
 * Returns: Success or fail message.
 * ***************************************************/

import { promises as fs } from 'fs';
import { readJsonFile } from '../read/read';

export async function deleteEntityInJsonFile(
    entityID: string | number,
    filePath: string
): Promise<{ ok: true; path: string } | never> {
    try {
        // ensure file exists, then read existing content
        await fs.stat(filePath);
        const parsed = await readJsonFile(filePath);

        if (!Array.isArray(parsed)) {
            throw new Error('JSON file does not contain an array of entities.');
        }

        const index = parsed.findIndex((item: any) => item.ID === entityID);
        if (index === -1) {
            throw new Error(`Entity with ID ${entityID} not found.`);
        }

        parsed.splice(index, 1); // remove the entity

        await fs.writeFile(filePath, JSON.stringify(parsed, null, 2), 'utf-8');
        return { ok: true, path: filePath };
    } catch (error) {
        throw error;
    }
}