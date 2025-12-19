import { readJsonFile } from '../../utils/read/read';

/*********************************************
 * Function: read
 * Description: Async function that uses the 
 * read function from /utils to read data from 
 * a JSON file with it's path passed in as a 
 * parameter.
 * Arguments: filePath - The path to the file 
 * to be read.
 * Returns: data The data read from the file
 * and return it.
 * Error: If there is an error reading the file, 
 * it will be caught and logged to the console.
 ********************************************/
export async function read(filePath: string): Promise<any> {
  try {
    const data: string = await readJsonFile(filePath);
    return data;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
}