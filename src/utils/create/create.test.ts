//jest test suite for create.ts file
import { writeToJsonFile } from './create';
import { promises as fs } from 'fs';

jest.mock('fs', () => ({
    promises: {
        writeFile: jest.fn(),
        stat: jest.fn(),
        readFile: jest.fn(),
    },
}));

describe('writeToJsonFile', () => {
    const mockFilePath = '../../../mock/mock-reps.json';
    // single entity to append to the JSON array
    const mockEntity = {
        "name": "JB Pruett",
        "phone": "(111) 111-1111",
        "email": "jb@jb.com",
        "ID": 999
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should write an entity to a JSON file successfully', async () => {
        (fs.stat as jest.Mock).mockResolvedValue(true);
        const existing = [{ name: 'Existing', phone: '(000)', email: 'ex@ex.com', ID: 1 }];
        (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(existing));
        (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

        const result = await writeToJsonFile(mockEntity, mockFilePath);

        expect(fs.stat).toHaveBeenCalledWith(mockFilePath);
        // expect the file to be written with the existing array plus the new entity
        const expected = JSON.stringify([...existing, mockEntity], null, 2);
        expect(fs.writeFile).toHaveBeenCalledWith(mockFilePath, expected, 'utf-8');
        expect(result).toEqual({ ok: true, path: expect.any(String) });
    });

    it('should create the file if it does not exist and then write the entity', async () => {
        (fs.stat as jest.Mock).mockRejectedValue(new Error('File not found'));
        // when creating a new file, readFile will be called after creating the empty array
        (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify([]));
        (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

        const result = await writeToJsonFile(mockEntity, mockFilePath);

        expect(fs.stat).toHaveBeenCalledWith(mockFilePath);
        expect(fs.writeFile).toHaveBeenNthCalledWith(1, mockFilePath, JSON.stringify([], null, 2), 'utf-8');
        const expectedNew = JSON.stringify([mockEntity], null, 2);
        expect(fs.writeFile).toHaveBeenNthCalledWith(2, mockFilePath, expectedNew, 'utf-8');
        expect(result).toEqual({ ok: true, path: expect.any(String) });
    });

    it('should throw an error if writing to the file fails', async () => {
        const mockError = new Error('Write failed');
        (fs.stat as jest.Mock).mockResolvedValue(true);
        const existing2 = [{ name: 'Existing2', ID: 2 }];
        (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(existing2));
        (fs.writeFile as jest.Mock).mockRejectedValue(mockError);

        await expect(writeToJsonFile(mockEntity, mockFilePath)).rejects.toThrow('Write failed');

        expect(fs.stat).toHaveBeenCalledWith(mockFilePath);
        const expected2 = JSON.stringify([...existing2, mockEntity], null, 2);
        expect(fs.writeFile).toHaveBeenCalledWith(mockFilePath, expected2, 'utf-8');
    });
});