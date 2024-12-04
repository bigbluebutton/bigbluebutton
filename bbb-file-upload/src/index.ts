import express, { Request, Response } from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';

const MAX_BODY_SIZE = 1024 * 1024 * 10; // 10MB
const SERVER_PORT = 8094;
const SERVER_HOST = '127.0.0.1';

// Initialize Express Application
const app = express();
app.use(express.json({ limit: MAX_BODY_SIZE }));

async function validateFileSize(url: string) {
  const MAX_FILE_SIZE_MB = 5;

  try {
    const response = await fetch(url, { method: 'HEAD' });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const contentLength = response.headers.get('Content-Length');

    if (contentLength) {
      const sizeInBytes = parseInt(contentLength, 10);
      const sizeInMB = sizeInBytes / (1024 * 1024); // convert bytes to MB
      console.log(`File size: ${sizeInMB.toFixed(2)} MB`);
      return sizeInMB > MAX_FILE_SIZE_MB;
    } else {
      throw new Error('Content-Length header is missing.');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error validating file size: ${error.message}`);
    } else {
      console.error('Error validating file size:', error);
    }
    return false; // Return false on error or if the size cannot be determined
  }
}

app.get('/api/rest/chatImageUpload', async (req: Request, res: Response) => {
  const imageUrl = req.url.split('?')[1];

  try {
    // Send a success response.
    console.log('[get] received image request:', imageUrl);

    const imagePath = path.join(__dirname, '..', 'uploads', imageUrl);

    res.sendFile(imagePath, (err) => {
      if (err) {
        console.error('Error sending the file:', err);
        res.status(500).send('Error serving the image.');
      }
    });
  } catch (error) {
      console.error(error);
      res.status(400).send({message: `Internal Server Error`});
    }
  }
);

app.post('/api/rest/chatImageUpload', async (req: Request, res: Response) => {

  const url = req.body.file;

  // if url contains a base64 string, do not download the file, only store it and return the filename
  if (url.startsWith('data:image')) {
    console.log('[post] received base64 image upload request');
    const base64Data = url.replace(/^data:image\/\w+;base64,/, '');
    const fileName = `${uuid()}.png`;
    const outputPath = path.join(__dirname, '..', 'uploads', fileName);
    fs.writeFileSync(outputPath, base64Data, 'base64');
    res.status(200).send({message: 'Image uploaded successfully', imageUrl: fileName});
    return;
  }


  validateFileSize(url).then((exceedsLimit) => {
    if (exceedsLimit) {
      console.error('File exceeds the maximum allowed size.');
      res.status(400).send({message: 'File exceeds the maximum allowed size.'});
      return;
    }
  });

  // filename should be a uuid with the original file extension
  const fileExtension = url.split('.').pop();
  const fileName = `${uuid()}.${fileExtension}`;

  // store file in the uploads directory
  const outputDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, fileName);
  console.log({outputPath});

  try {
    console.log('[post] received image upload request for:', url);

    axios({
      url,
      method: 'GET',
      responseType: 'stream',
    }).then((response) => {
      const fileStream = fs.createWriteStream(outputPath);
      response.data.pipe(fileStream);
  
      fileStream.on('finish', () => {
        fileStream.close();
        console.log('Download completed!');
        res.status(200).send({message: 'Image uploaded successfully', imageUrl: fileName});
      });
    }).catch((err) => {
      console.error(`Error: ${err.message}`);
      res.status(400).send({message: `Internal Server Error`});
    });
  } catch (error) {
      console.error(error);
      res.status(400).send({message: `Internal Server Error`});
    }
  }
);

const startServer = () => {
  console.info("Starting server");
  app.listen(SERVER_PORT, SERVER_HOST, () => {
    console.log(`Server is running on ${SERVER_HOST}:${SERVER_PORT}`);
    console.info("Waiting for requests");
  });
}

// Start the Server
startServer();
