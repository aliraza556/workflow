import { Storage } from '@google-cloud/storage';

// Initialize the Google Cloud client library with your credentials
const storage = new Storage({
    keyFilename: 'deep-castle-396822-631527610f9e.json'
});

// The name of your Google Cloud Storage bucket
const bucketName = 'videos_tta';

async function listFolders(bucketName: string): Promise<string[]> {
    const options = {
        autoPaginate: false,
        delimiter: '/',
        prefix: '' // use a specific prefix if you want to list folders in a specific directory
    };

    try {
        const [files, ,] = await storage.bucket(bucketName).getFiles(options);
        const folderSet = new Set<string>();

        files.forEach(file => {
            const folderPath = file.name.split('/').slice(0, -1).join('/');
            if (folderPath) {
                folderSet.add(folderPath);
            }
        });

        const folders = Array.from(folderSet);
        console.log('Folders:', folders);
        return folders;
    } catch (error) {
        console.error('Error listing folders:', error);
        return []; // return an empty array in case of an error
    }
}

// Example usage
listFolders(bucketName).catch(console.error);
