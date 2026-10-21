package org.bigbluebutton.presentation.imp;

import org.apache.poi.sl.usermodel.Placeholder;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFNotes;
import org.apache.poi.xslf.usermodel.XSLFShape;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextParagraph;
import org.apache.poi.xslf.usermodel.XSLFTextShape;
import org.bigbluebutton.presentation.Util;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.OptionalInt;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

public final class SpeakerNotesExtractor {
    private static final Logger log = LoggerFactory.getLogger(SpeakerNotesExtractor.class);
    private static final String DRAW_NS = "urn:oasis:names:tc:opendocument:xmlns:drawing:1.0";
    private static final String PRESENTATION_NS = "urn:oasis:names:tc:opendocument:xmlns:presentation:1.0";
    private static final String STYLE_NS = "urn:oasis:names:tc:opendocument:xmlns:style:1.0";
    private static final String TEXT_NS = "urn:oasis:names:tc:opendocument:xmlns:text:1.0";

    private SpeakerNotesExtractor() {
    }

    public static OptionalInt extract(File sourceFile, File presentationDirectory) {
        File outputDirectory = new File(presentationDirectory, "speakernotes");
        try {
            String filename = sourceFile.getName().toLowerCase();
            List<String> notes;
            if (filename.endsWith(".pptx")) {
                notes = extractPptx(sourceFile);
            } else if (filename.endsWith(".odp")) {
                notes = extractOdp(sourceFile);
            } else {
                return OptionalInt.empty();
            }

            Files.createDirectories(outputDirectory.toPath());
            for (int index = 0; index < notes.size(); index++) {
                Path noteFile = outputDirectory.toPath().resolve("slide-" + (index + 1) + ".txt");
                Files.writeString(noteFile, notes.get(index), StandardCharsets.UTF_8);
            }
            return OptionalInt.of(notes.size());
        } catch (Exception exception) {
            if (outputDirectory.exists()) {
                Util.deleteDirectory(outputDirectory);
            }
            log.warn("Speaker notes extraction failed for file type {}: {}",
                    extensionOf(sourceFile), exception.getClass().getSimpleName());
            return OptionalInt.empty();
        }
    }

    private static List<String> extractPptx(File sourceFile) throws Exception {
        List<String> notes = new ArrayList<>();
        try (InputStream inputStream = new FileInputStream(sourceFile);
             XMLSlideShow slideShow = new XMLSlideShow(inputStream)) {
            for (XSLFSlide slide : slideShow.getSlides()) {
                if (!slide.isHidden()) {
                    notes.add(pptxNotesText(slide.getNotes()));
                }
            }
        }
        return notes;
    }

    private static String pptxNotesText(XSLFNotes notes) {
        if (notes == null) {
            return "";
        }
        for (XSLFShape shape : notes.getShapes()) {
            if (shape instanceof XSLFTextShape textShape
                    && textShape.getPlaceholderDetails().getPlaceholder() == Placeholder.BODY) {
                return joinParagraphs(textShape.getTextParagraphs());
            }
        }
        return "";
    }

    private static String joinParagraphs(List<XSLFTextParagraph> paragraphs) {
        return String.join("\n", paragraphs.stream()
                .map(XSLFTextParagraph::getText)
                .map(String::strip)
                .toList()).strip();
    }

    private static List<String> extractOdp(File sourceFile) throws Exception {
        try (ZipFile zipFile = new ZipFile(sourceFile)) {
            ZipEntry contentEntry = zipFile.getEntry("content.xml");
            if (contentEntry == null) {
                throw new IllegalArgumentException("Missing content.xml");
            }

            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
            factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
            factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
            factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");

            Document document;
            try (InputStream inputStream = zipFile.getInputStream(contentEntry)) {
                document = factory.newDocumentBuilder().parse(inputStream);
            }

            Set<String> hiddenStyles = hiddenOdpStyles(document);
            List<String> notes = new ArrayList<>();
            NodeList pages = document.getElementsByTagNameNS(DRAW_NS, "page");
            for (int index = 0; index < pages.getLength(); index++) {
                Element page = (Element) pages.item(index);
                String styleName = page.getAttributeNS(DRAW_NS, "style-name");
                if (!hiddenStyles.contains(styleName)) {
                    notes.add(odpNotesText(page));
                }
            }
            return notes;
        }
    }

    private static Set<String> hiddenOdpStyles(Document document) {
        Set<String> hiddenStyles = new HashSet<>();
        NodeList styles = document.getElementsByTagNameNS(STYLE_NS, "style");
        for (int index = 0; index < styles.getLength(); index++) {
            Element style = (Element) styles.item(index);
            NodeList properties = style.getElementsByTagNameNS(STYLE_NS, "drawing-page-properties");
            if (properties.getLength() > 0) {
                Element pageProperties = (Element) properties.item(0);
                if ("hidden".equals(pageProperties.getAttributeNS(PRESENTATION_NS, "visibility"))) {
                    hiddenStyles.add(style.getAttributeNS(STYLE_NS, "name"));
                }
            }
        }
        return hiddenStyles;
    }

    private static String odpNotesText(Element page) {
        NodeList notesElements = page.getElementsByTagNameNS(PRESENTATION_NS, "notes");
        if (notesElements.getLength() == 0) {
            return "";
        }
        List<String> paragraphs = new ArrayList<>();
        NodeList frames = ((Element) notesElements.item(0)).getElementsByTagNameNS(DRAW_NS, "frame");
        for (int frameIndex = 0; frameIndex < frames.getLength(); frameIndex++) {
            Element frame = (Element) frames.item(frameIndex);
            if ("notes".equals(frame.getAttributeNS(PRESENTATION_NS, "class"))) {
                NodeList paragraphElements = frame.getElementsByTagNameNS(TEXT_NS, "p");
                for (int paragraphIndex = 0; paragraphIndex < paragraphElements.getLength(); paragraphIndex++) {
                    Node paragraph = paragraphElements.item(paragraphIndex);
                    String text = paragraph.getTextContent().strip();
                    paragraphs.add(text);
                }
            }
        }
        return String.join("\n", paragraphs).strip();
    }

    private static String extensionOf(File sourceFile) {
        String name = sourceFile.getName();
        int separator = name.lastIndexOf('.');
        return separator >= 0 ? name.substring(separator + 1).toLowerCase() : "unknown";
    }
}
