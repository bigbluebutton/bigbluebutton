import { RequestHandler } from "express";
import hocuspocus from "../hocuspocus";
import * as Y from "yjs";
import { Logger } from "../common/logger";
import { ServerBlockNoteEditor } from "@blocknote/server-util";
import { validateInitialContentJson } from "./utils";

interface DocumentApi {
  get: RequestHandler;
  post: RequestHandler;
}

const logger = new Logger('express-rest-api');

const documentApi: DocumentApi = {
  get: async (request, response) => {
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
  },
  post: async (request, response) => {
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
  },
}


export { documentApi };