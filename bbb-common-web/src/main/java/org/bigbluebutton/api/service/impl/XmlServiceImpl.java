package org.bigbluebutton.api.service.impl;

import org.bigbluebutton.api.service.XmlService;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.ByteArrayInputStream;
import java.io.StringWriter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.*;

public class XmlServiceImpl implements XmlService {

    private static Logger logger = LoggerFactory.getLogger(XmlServiceImpl.class);

    private static final String NO_RECORDINGS_RESPONSE =
            "<response><returncode>SUCCESS</returncode>" +
            "<messageKey>noRecordings</messageKey>" +
            "<message>No recordings found. This may occur if you attempt to retrieve all recordings.</message></response>";

    private static final String FAILED_RESPONSE =
            "<response><returncode>FAILED</returncode>" +
            "<messageKey>unexpectedError</messageKey>" +
            "<message>An unexpected error occurred while constructing the response.</message></response>";

    private DocumentBuilderFactory factory;
    private DocumentBuilder builder;

    @Override
    public String noRecordings() {
        logger.info("Constructing no recordings response");

        try {
            setup();
            Document document = builder.newDocument();

            Element rootElement = createElement(document, "response", null);
            document.appendChild(rootElement);

            Element returnCode = createElement(document, "returncode", "SUCCESS");
            rootElement.appendChild(returnCode);

            Element messageKey = createElement(document, "messageKey", "noRecordings");
            rootElement.appendChild(messageKey);

            Element message = createElement(document, "message", "No recordings found. This may occur if you attempt to retrieve all recordings.");
            rootElement.appendChild(message);

            return documentToString(document);
        } catch(Exception e) {
            logger.error("Failed to construct no recordings response", e);
        }

        return NO_RECORDINGS_RESPONSE;
    }

    @Override
    public String constructPaginatedResponse(Page<?> page, int offset, String response) {
        logger.info("Constructing paginated response");

        if(response == null || response.equals("")) {
            return FAILED_RESPONSE;
        }

        try {
            setup();

            Document document = builder.parse(new ByteArrayInputStream(response.getBytes()));
            Element rootElement = document.getDocumentElement();

            Element totalElements = createElement(document, "totalElements", String.valueOf(page.getTotalElements()));
            rootElement.appendChild(totalElements);

            return documentToString(document);
        } catch (Exception e) {
            logger.error("Failed to add pagination info to recordings response", e);
        }

        return response;
    }

    private void setup() throws ParserConfigurationException {
        if(factory == null) {
            factory = DocumentBuilderFactory.newInstance();
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
            factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
            factory.setExpandEntityReferences(false);
        }
        if(builder == null) builder = factory.newDocumentBuilder();
    }

    private Element createElement(Document document, String name, String value) {
        Element element = document.createElement(name);
        if(value != null) element.setTextContent(value);
        return element;
    }

    public String documentToString(Document document) {
        String output = "";

        try {
            TransformerFactory factory = TransformerFactory.newInstance();
            Transformer transformer = factory.newTransformer();
            transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
            transformer.setOutputProperty(OutputKeys.INDENT, "no");
            StringWriter writer = new StringWriter();
            transformer.transform(new DOMSource(document), new StreamResult(writer));
            output = writer.toString();
        } catch(Exception e) {
            logger.error("Failed to serialize XML document to string", e);
        }

        return output;
    }
}
