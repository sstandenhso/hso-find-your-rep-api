//Test suite for  read.ts file
import { read } from './read';
import { readJsonFile } from '../../utils/read/read';
import { TestData } from '../../types/types';

jest.mock('../../utils/read/read', () => ({
  readJsonFile: jest.fn(),
}));

describe('read function', () => {
    //Mock the file passed as filepath
    beforeEach(() => {
        (readJsonFile as jest.MockedFunction<typeof readJsonFile>).mockResolvedValue([
            { id: 1, name: 'John Doe' },
            { id: 2, name: 'Jane Doe' }
        ]);
    });
  
    //Restore the original file system after each test
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return the content of the file', async () => {
        const content: TestData = await read('testfile.txt');
        expect(content).toEqual([
            { id: 1, name: 'John Doe' },
            { id: 2, name: 'Jane Doe' }
        ]);
    });

    it('should handle file read errors', async () => {
        (readJsonFile as jest.MockedFunction<typeof readJsonFile>).mockRejectedValue(new Error('File not found'));
        await expect(read('nonexistentfile.txt')).rejects.toThrow('File not found');
    });

    it('should handle empty file content', async () => {
        (readJsonFile as jest.MockedFunction<typeof readJsonFile>).mockResolvedValue([]);
        const content = await read('emptyfile.txt');
        expect(content).toEqual([]);
    });
});