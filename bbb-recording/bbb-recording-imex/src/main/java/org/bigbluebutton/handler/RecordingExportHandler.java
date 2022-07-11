package org.bigbluebutton.handler;

import org.bigbluebutton.dao.entity.*;
import org.bigbluebutton.dao.DataStore;
import org.bigbluebutton.service.XmlService;
import org.bigbluebutton.service.impl.XmlServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;
import java.io.File;
import java.io.StringReader;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

public class RecordingExportHandler {

    private static final Logger logger = LoggerFactory.getLogger(RecordingExportHandler.class);

    private static RecordingExportHandler instance;
    private final DataStore dataStore;
    private final XmlService xmlService;

    private RecordingExportHandler() {
        dataStore = DataStore.getInstance();
        xmlService = new XmlServiceImpl();
    }

    public static RecordingExportHandler getInstance() {
        if (instance == null) {
            instance = new RecordingExportHandler();
            if (instance.dataStore == null)
                instance = null;
        }

        return instance;
    }

    public void exportRecordings(String path) {
        List<Recording> recordings = dataStore.findAll(Recording.class);

        for (Recording recording : recordings) {
            exportRecording(recording, path);
        }
    }

    public void exportRecording(String recordId, String path) {
        Recording recording = null;
        if (recordId != null) {
            recording = dataStore.findRecordingByRecordId(recordId);
        }

        if (recording != null) {
            exportRecording(recording, path);
        }
    }

    private void exportRecording(Recording recording, String path) {
        logger.info("Attempting to export recording {} to {}", recording.getRecordId(), path);
        try {

            Path dirPath = Paths.get(path);
            File dir = new File(dirPath.toAbsolutePath() + File.separator + recording.getRecordId());
            logger.info("Checking if directory {} exists", dir.getAbsolutePath());
            if (!dir.exists()) {
                logger.info("Directory does not exist, creating");
                boolean directoryCreated = dir.mkdir();
                if (!directoryCreated) {
                    logger.info("Failed to create export directory.");
                    return;
                }
            }

            File file = new File(dir + File.separator + "metadata.xml");

            if (file.exists()) {
                logger.info("File {} already exists...replacing it", file.getPath());
                boolean deleted = file.delete();
                if (!deleted) {
                    logger.info("Failed to remove previous metadata file.");
                    return;
                }
            }

            logger.info("Attempting to create file {}", file.getAbsolutePath());
            boolean fileCreated = file.createNewFile();

            if (fileCreated) {
                logger.info("Exporting {}", recording);

                String xml = xmlService.recordingToXml(recording);

                DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
                DocumentBuilder builder = factory.newDocumentBuilder();
                Document document = builder.parse(new InputSource(new StringReader(xml)));

                document.normalize();
                XPath xPath = XPathFactory.newInstance().newXPath();
                NodeList nodeList = (NodeList) xPath.evaluate("//text()[normalize-space()='']", document,
                        XPathConstants.NODESET);

                for (int i = 0; i < nodeList.getLength(); i++) {
                    Node node = nodeList.item(i);
                    node.getParentNode().removeChild(node);
                }

                TransformerFactory transformerFactory = TransformerFactory.newInstance();
                Transformer transformer = transformerFactory.newTransformer();
                transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
                transformer.setOutputProperty(OutputKeys.INDENT, "yes");
                transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "2");
                transformer.setOutputProperty(OutputKeys.STANDALONE, "no");
                DOMSource source = new DOMSource(document);

                StreamResult result = new StreamResult(file);
                transformer.transform(source, result);
            }
        } catch (Exception e) {
            logger.error("Failed to export recording {}", recording.getRecordId());
            e.printStackTrace();
        }
    }
}
