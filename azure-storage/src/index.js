const express = require('express');
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
} = require('@azure/storage-blob');

if (!process.env.PORT) {
  throw new Error(
    'Specify port number for HTTP server with environment variable.'
  );
}
if (!process.env.STORAGE_ACCOUNT_NAME) {
  throw new Error('Specify STORAGE_ACCOUNT_NAME with environment variable.');
}
if (!process.env.STORAGE_ACCOUNT_KEY) {
  throw new Error('Specify STORAGE_ACCOUNT_KEY with environment variable.');
}

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

console.log(
  `Serving videos from Azure storage account ${STORAGE_ACCOUNT_NAME}.`
);

const app = express();

app.get('/video', async (req, res) => {
  const videoPath = req.query.path;
  const containerName = 'videos';
  const blobService = createBlobService();
  const containerClient = blobService.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(videoPath);

  console.log(`Streaming video from path ${videoPath}.`);

  const properties = await blobClient.getProperties();

  res.writeHead(200, {
    'Container-Length': properties.contentLength,
    'Content-Type': 'video/mp4',
  });

  const response = await blobClient.download();
  response.readableStreamBody.pipe(res);
});

app.listen(PORT, console.log('video-storage listening on port: ', PORT));
