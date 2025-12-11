//jest test suite for read.ts file 
import { readJsonFile } from './read';
import { promises as fs } from 'fs';

jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(),
    },
}));

describe('readJsonFile', () => {
    const mockFilePath = '../../../mock/mock-reps.json';

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should read and parse a JSON file successfully', async () => {
        const mockData = { salesReps: [
                            {
                            "name": "Jarret Bilbrey",
                            "phone": "(539) 549-4707",
                            "email": "Jarret.Bilbrey@henryschein.com",
                            "ID": 517
                            },
                            {
                            "name": "Carrie Gabriel",
                            "phone": "(248) 285-0895",
                            "email": "Carrie.Gabriel@henryschein.com",
                            "ID": 521
                            },
                            {
                            "name": "Mandy Deus",
                            "phone": "(720) 454-7372",
                            "email": "Mandy.Deus@henryschein.com",
                            "ID": 528
                            }
                        ] 
                        };
        (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

        const result = await readJsonFile(mockFilePath);

        expect(fs.readFile).toHaveBeenCalledWith(mockFilePath, 'utf-8');
        expect(result).toEqual(mockData);
    }
    );
    
    it('should throw an error if reading the file fails', async () => {
        const mockError = new Error('File not found');
        (fs.readFile as jest.Mock).mockRejectedValue(mockError);        

    });

    it('should throw an error if parsing the JSON fails', async () => {
        const invalidJson = "{ key: 'value' "; // Invalid JSON
        (fs.readFile as jest.Mock).mockResolvedValue(invalidJson);

        await expect(readJsonFile(mockFilePath)).rejects.toThrow(SyntaxError);
        expect(fs.readFile).toHaveBeenCalledWith(mockFilePath, 'utf-8');
    });
});  