//Test suite for deleteEntityInJsonFile function
import { deleteEntityInJsonFile } from './delete';
import { promises as fs } from 'fs';

jest.mock('fs', () => ({
    promises: {
        writeFile: jest.fn(),
        stat: jest.fn(),
        readFile: jest.fn(),
    },
}));

describe('deleteEntityInJsonFile', () => {
    const mockFilePath = '../../../mock/mock-reps.json';
    const mockEntityID = 999;

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should delete an existing entity from a JSON file successfully', async () => {
        (fs.stat as jest.Mock).mockResolvedValue(true);
        const existing = [
            { name: 'Existing', phone: '(000)', email: 'test@test.net', ID: 1 },
            { name: 'ToDelete', phone: '(123)', email: 'test2@test2.net', ID: mockEntityID }
        ];
        (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(existing));
        (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

        const result = await deleteEntityInJsonFile(mockEntityID, mockFilePath);

        expect(fs.stat).toHaveBeenCalledWith(mockFilePath);
        expect(fs.readFile).toHaveBeenCalledWith(mockFilePath, 'utf-8');
        // expect the file to be written without the deleted entity
        const expected = JSON.stringify([existing[0]], null, 2);
        expect(fs.writeFile).toHaveBeenCalledWith(mockFilePath, expected, 'utf-8');
        expect(result).toEqual({ ok: true, path: expect.any(String) });
    });
    
    it('should throw an error if the entity to delete does not exist', async () => {
        (fs.stat as jest.Mock).mockResolvedValue(true);
        const existing = [
            { name: 'Existing', phone: '(000)', email: 'test@test.net', ID: 1 }
        ];
        (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(existing));

        await expect(deleteEntityInJsonFile(mockEntityID, mockFilePath)).rejects.toThrow(`Entity with ID ${mockEntityID} not found.`);
    });

    it('should throw an error if the JSON file does not contain an array', async () => {
        (fs.stat as jest.Mock).mockResolvedValue(true);
        const existing = { name: 'SingleEntity', phone: '(000)', email: '111@t.com', ID: 1 };
        (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(existing));

        await expect(deleteEntityInJsonFile(mockEntityID, mockFilePath)).rejects.toThrow('JSON file does not contain an array of entities.');
    });
});