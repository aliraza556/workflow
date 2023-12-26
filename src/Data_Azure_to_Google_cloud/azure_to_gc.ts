import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { Storage } from '@google-cloud/storage';
import * as fs from 'fs';
import * as path from 'path';

const azureAccount = "techacademystorage";
const azureAccountKey = "z5UhLZclW9HnVTSWUEhJT6mM//8Cc3HEGiW/ywlRuZIkDUW1KwXDe5SgiFOLnE70unstu2kUpLIo0h/78CYfqA==";
const sharedKeyCredential = new StorageSharedKeyCredential(azureAccount, azureAccountKey);
const blobServiceClient = new BlobServiceClient(
    `https://${azureAccount}.blob.core.windows.net`,
    sharedKeyCredential
);

const googleCloudKeyFilename = 'deep-castle-396822-631527610f9e.json';
const googleCloudBucketName = 'videos_tta';

const gcsStorage = new Storage({ keyFilename: googleCloudKeyFilename });

async function downloadAzureContainer(containerName: string): Promise<void> {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const localFolderPath = `./${containerName}`;
    fs.mkdirSync(localFolderPath, { recursive: true });

    for await (const blob of containerClient.listBlobsFlat()) {
        const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
        await blockBlobClient.downloadToFile(path.join(localFolderPath, blob.name));
    }
}

async function uploadToGoogleCloud(localFolderPath: string, containerName: string): Promise<void> {
    const bucket = gcsStorage.bucket(googleCloudBucketName);
    const files = fs.readdirSync(localFolderPath);

    for (const file of files) {
        await bucket.upload(path.join(localFolderPath, file), {
            destination: `${containerName}/${file}`,
        });
    }
}

async function main() {
    const containers = await blobServiceClient.listContainers();
    let downloadCount = 0;
    let uploadCount = 0;

    for await (const container of containers) {
        if (container.name.startsWith('asset-')) {
            await downloadAzureContainer(container.name);
            downloadCount++;

            await uploadToGoogleCloud(`./${container.name}`, container.name);
            uploadCount++;

            fs.rmdirSync(`./${container.name}`, { recursive: true });
        }
    }

    console.log(`Downloaded ${downloadCount} containers.`);
    console.log(`Uploaded ${uploadCount} containers.`);
}

main().catch((error) => {
    console.error("Error occurred:", error);
});
