const express = require('express');
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
} = require('@azure/storage-blob');

const PORT = process.env.PORT;
const STORAGE_ACCOUNT_NAME = process.env.STORAGE_ACCOUNT_NAME;
const STORAGE_ACCOUNT_KEY = process.env.STORAGE_ACCOUNT_KEY;
const BLOB_PATH = `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`;

function createBlobService() {
  const sharedKeyCredential = new StorageSharedKeyCredential(
    STORAGE_ACCOUNT_NAME,
    STORAGE_ACCOUNT_KEY
  );
  const blobService = new BlobServiceClient(BLOB_PATH, sharedKeyCredential);
  return blobService;
}

const app = express();

app.get('/video', async (req, res) => {
  const videoPath = process.query.path;
  const containerName = 'videos';
  const blobService = createBlobService();
  const containerClient = blobService.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(videoPath);

  const properties = await blobClient.getProperties();

  res.writeHead(200, {
    'Container-Length': properties.contentLength,
    'Content-Type': 'video/mp4',
  });

  const response = await blobClient.download();
  response.readableStreamBody.pipe(res);
});

app.listen(PORT, console.log('video-storage listening on port: ', PORT));
