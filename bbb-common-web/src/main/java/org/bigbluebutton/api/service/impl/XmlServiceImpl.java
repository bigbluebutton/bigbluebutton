package org.bigbluebutton.api.service.impl;

import org.bigbluebutton.api.MeetingService;
import org.bigbluebutton.api.model.entity.*;
import org.bigbluebutton.api.service.XmlService;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.ByteArrayInputStream;
import java.lang.reflect.Field;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Node;

public class XmlServiceImpl implements XmlService {

    private static Logger log = LoggerFactory.getLogger(MeetingService.class);

    private DocumentBuilderFactory factory;
    private DocumentBuilder builder;

    @Override
    public String recordingToXml(Recording recording) {
        try {
            setup();
            Document document = builder.newDocument();

            Element rootElement = createElement(document,"recording", null);
            document.appendChild(rootElement);
            appendFields(document, rootElement, recording, new String[] {"id", "metadata", "format", "callbackData"}, Type.CHILD);

            Element meta = createElement(document, "meta", null);
            rootElement.appendChild(meta);

            String xml;
            Document secondDoc;
            Node node;

            for(Metadata metadata: recording.getMetadata()) {
                xml = metadataToXml(metadata);
                secondDoc = builder.parse(new ByteArrayInputStream(xml.getBytes()));
                node = document.importNode(secondDoc.getDocumentElement(), true);
                meta.appendChild(node);
            }

            xml = playbackFormatToXml(recording.getFormat());
            secondDoc = builder.parse(new ByteArrayInputStream(xml.getBytes()));
            node = document.importNode(secondDoc.getDocumentElement(), true);
            meta.appendChild(node);

            xml = callbackDataToXml(recording.getCallbackData());
            secondDoc = builder.parse(new ByteArrayInputStream(xml.getBytes()));
            node = document.importNode(secondDoc.getDocumentElement(), true);
            meta.appendChild(node);

            return document.toString();
        } catch(Exception e) {

        }

        return null;
    }

    @Override
    public String metadataToXml(Metadata metadata) {
        try {
            setup();
            Document document = builder.newDocument();

            Element rootElement = createElement(document, metadata.getKey(), metadata.getValue());
            document.appendChild(rootElement);

            return document.toString();

        } catch(Exception e) {

        }

        return null;
    }

    @Override
    public String playbackFormatToXml(PlaybackFormat playbackFormat) {
        try {
            setup();
            Document document = builder.newDocument();

            Element rootElement = createElement(document, "playback", null);
            document.appendChild(rootElement);
            appendFields(document, rootElement, playbackFormat, new String[] {"id", "recording", "thumbnails"}, Type.CHILD);

            Element images = createElement(document, "images", null);
            rootElement.appendChild(images);

            List<Thumbnail> thumbnails = new ArrayList<>(playbackFormat.getThumbnails());
            Collections.sort(thumbnails);

            for(Thumbnail thumbnail: thumbnails) {
                String xml = thumbnailToXml(thumbnail);
                Document thumbnailDoc = builder.parse(new ByteArrayInputStream(xml.getBytes()));
                Node node = document.importNode(thumbnailDoc.getDocumentElement(), true);
                images.appendChild(node);
            }

            return document.toString();
        } catch(Exception e) {

        }
        return null;
    }

    @Override
    public String thumbnailToXml(Thumbnail thumbnail) {
        try {
            setup();
            Document document = builder.newDocument();

            Element rootElement = createElement(document, "image", thumbnail.getUrl());
            document.appendChild(rootElement);
            appendFields(document, rootElement, thumbnail, new String[] {"id", "url"}, Type.ATTRIBUTE);

            return document.toString();
        } catch(Exception e) {

        }

        return null;
    }

    @Override
    public String callbackDataToXml(CallbackData callbackData) {
        try {
            setup();
            Document document = builder.newDocument();

            Element rootElement = createElement(document, "callback", null);
            document.appendChild(rootElement);
            appendFields(document, rootElement, callbackData, new String[] {"id", "recording"}, Type.CHILD);

            return document.toString();
        } catch(Exception e) {

        }

        return null;
    }

    private void setup() throws ParserConfigurationException {
        if(factory == null) factory = DocumentBuilderFactory.newInstance();
        if(builder == null) builder = factory.newDocumentBuilder();
    }

    private Element createElement(Document document, String name, String value) {
        Element element = document.createElement(name);

        if(value != null) element.setTextContent(value);

        return element;
    }

    private void appendFields(Document document, Element parent, Object object, String[] ignoredFields, Type type) throws IllegalAccessException {
        Field[] fields = object.getClass().getDeclaredFields();

        for(Field field: fields) {
            if(Arrays.stream(ignoredFields).anyMatch(field.getName()::equals)) continue;
            field.setAccessible(true);
            Object fieldValue = field.get(object);
            if(fieldValue != null) {
                if(fieldValue instanceof LocalDateTime) {
                    fieldValue = localDateTimeToEpoch((LocalDateTime) object);
                }

                switch(type) {
                    case CHILD:
                        Element child = createElement(document, field.getName(), fieldValue.toString());
                        parent.appendChild(child);
                        break;
                    case ATTRIBUTE:
                        parent.setAttribute(field.getName(), fieldValue.toString());
                        break;
                }
            }
        }

    }

    private String localDateTimeToEpoch(LocalDateTime localDateTime) {
        Instant instant = localDateTime.atZone(ZoneId.systemDefault()).toInstant();
        return String.valueOf(instant.toEpochMilli());
    }

    private enum Type {
        CHILD,
        ATTRIBUTE
    }
}