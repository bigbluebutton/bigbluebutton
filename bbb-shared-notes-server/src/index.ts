import express from "express";
import * as Y from "yjs";
import expressWebsockets from "express-ws";
import { loadConfiguration } from "./config";
import startRedis from "./redis/subscriber";
import { startPostgres } from "./database/bbb-postgres";
import hocuspocus from "./hocuspocus";
import { Logger } from "./common/logger";
import { ServerBlockNoteEditor } from "@blocknote/server-util";
import { validateInitialContentJson } from "./express/utils";
import path from "path";

const logger = new Logger('index.ts');

loadConfiguration();
startRedis();
startPostgres();

// Setup your express instance using the express-ws extension
const { app } = expressWebsockets(express());

// Add middleware to parse JSON bodies
app.use(express.json());

// Add middleware to parse raw binary data for Yjs format
app.use('/api/documents', express.raw({ type: 'application/octet-stream', limit: '10mb' }));

// Serve static files from sample directory (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use('/sample', express.static(path.join(__dirname, '../sample')));
  logger.info('Sample files available at /sample');
}

app.ws("/collaboration", async (websocket, request) => {
  logger.info('=== WebSocket Request Data ===');

  // The URL at this point is just the endpoint
  const url = new URL(request.url, `http://${request.headers.host}`);
  const sessionToken = url.searchParams.get('sessionToken');

  const context = {
    sessionToken,
    websocket,
  }
  hocuspocus.handleConnection(websocket, request, context);
});


app.get("/api/documents/:documentName", async (request, response) => {
  const { documentName } = request.params;

  try {
    const connection = await hocuspocus.openDirectConnection(documentName);
    const doc = connection.document;

    if (!doc) {
      await connection.disconnect();
      return response.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    const fragment = doc.getXmlFragment("doc");

    // Extract text content recursively from XML elements
    const extractText = (element: Y.XmlElement | Y.XmlFragment): string => {
      let text = '';
      for (let i = 0; i < element.length; i++) {
        const child = element.get(i);
        if (child instanceof Y.XmlText) {
          text += child.toString();
        } else if (child instanceof Y.XmlElement) {
          text += extractText(child);
        }
      }
      return text;
    };

    const content = extractText(fragment);

    await connection.disconnect();

    logger.info('Document retrieved successfully', { documentName });
    response.status(200).json({
      success: true,
      documentName,
      content,
      isEmpty: fragment.length === 0
    });
  } catch (error) {
    logger.error('Error retrieving document', { error, documentName });
    response.status(500).json({
      success: false,
      error: 'Failed to retrieve document',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post("/api/documents/:documentName", async (request, response) => {
  const { documentName } = request.params;

  const validationResult = validateInitialContentJson(request.body);
  if (validationResult.valid) {
    const { blocks: initialBlocks } = request.body;
    try {
      const connection = await hocuspocus.openDirectConnection(documentName);

      const doc = connection.document;

      if (!doc) {
        await connection.disconnect();
        return response.status(500).json({
          success: false,
          error: 'Failed to initialize document'
        });
      }

      const fragment = doc.getXmlFragment("doc");

      // Check if document already has content
      if (fragment.length > 0) {
        await connection.disconnect();
        return response.status(409).send("Document already exists");
      }

      // Create a ServerBlockNoteEditor instance
      const editor = ServerBlockNoteEditor.create();

      // Convert blocks to Yjs XML Fragment directly in our document's fragment
      editor.blocksToYXmlFragment(initialBlocks, fragment);

      await connection.disconnect();

      logger.info('Document created/loaded successfully', { documentName });
      response.status(204).send();
    } catch (error) {
      logger.error('Error creating document', { error, documentName });
      response.status(500).json({
        success: false,
        error: 'Failed to create document',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
});

// Start the server
app.listen(8787, () => console.log("Listening on http://127.0.0.1:8787"));