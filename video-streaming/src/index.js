const express = require('express');
const fs = require('fs');

const app = express();

// const PORT = 3000;
if (!process.env.PORT) {
  throw new Error('PORT environment variable not found');
}

const PORT = process.env.PORT;

app.get('/', async (req, res) => {
  const videoPath = './videos/SampleVideo_1280x720_1mb.mp4';

  const stats = await fs.promises.stat(videoPath);

  res.writeHead(200, {
    'content-length': stats.size,
    'content-type': 'video/mp4',
  });

  fs.createReadStream(videoPath).pipe(res);
});

app.listen(PORT, console.log('Listening on port ', PORT));
