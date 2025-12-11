//jest test file for updateEntityInJsonFile
import { updateEntityInJsonFile } from './update';
import { promises as fs } from 'fs';

jest.mock('fs', () => ({
    promises: {
        writeFile: jest.fn(),
        readFile: jest.fn(),
    },
}));

describe('updateEntityInJsonFile', () => {
    const mockFilePath = '../../../mock/mock-reps.json';
    const mockEntityID = 999;

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should update an existing entity in a JSON file successfully', async () => {
        const existing = [
            { "name": 'Existing1', "phone": '(000)', "email": 'test@test.net', "ID": 1 },
            { "name": 'ToUpdate', "phone": '(123)', "email": 'jjj@test.net', "ID": mockEntityID }
        ];
        (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(existing));
        (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

        const newEntity = { name: 'UpdatedName', phone: '(123)', email: 'jjj@test.net' };
        const result = await updateEntityInJsonFile(mockEntityID, mockFilePath, newEntity);

        expect(fs.readFile).toHaveBeenCalledWith(mockFilePath, 'utf-8');
        // expect the file to be written with the updated entity
        expect(fs.writeFile).toHaveBeenCalled();
        const writeCall = (fs.writeFile as jest.Mock).mock.calls[0];
        expect(writeCall[0]).toBe(mockFilePath);
        // parse the written JSON and assert updated entity has updatedAt string
        const written = JSON.parse(writeCall[1]);
        expect(written[0]).toEqual(existing[0]);
        expect(written[1]).toMatchObject({ ...existing[1], ...newEntity });
        expect(writeCall[2]).toBe('utf-8');
        expect(result).toEqual({ ok: true, path: expect.any(String) });
    });

    it('should throw an error if the entity to update does not exist', async () => {
        const existing = [
            { name: 'Existing1', phone: '(000)', email: 'test@test.net', ID: 1 }
        ];
        (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(existing));
        
        const newEntity = { name: 'DoesNotMatter' };
        await expect(updateEntityInJsonFile(mockEntityID, mockFilePath, newEntity)).rejects.toThrow(`Entity with ID ${mockEntityID} not found.`);
    });

    it('should throw an error if the JSON file does not contain an array', async () => {
        const existing = { name: 'SingleEntity', phone: '(000)', email: '123@me.com', ID: 1 };
        (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(existing));
        
        const newEntity2 = { name: 'NoArray' };
        await expect(updateEntityInJsonFile(mockEntityID, mockFilePath, newEntity2)).rejects.toThrow('JSON file does not contain an array of entities.');
    });
    
    it('should throw an error if reading the file fails', async () => {
        const mockError = new Error('Read failed');
        (fs.readFile as jest.Mock).mockRejectedValue(mockError);
        const newEntity3 = { name: 'ReadFail' };
        await expect(updateEntityInJsonFile(mockEntityID, mockFilePath, newEntity3)).rejects.toThrow('Read failed');
    });
});