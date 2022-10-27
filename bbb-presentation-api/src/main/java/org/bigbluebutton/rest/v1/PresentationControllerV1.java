package org.bigbluebutton.rest.v1;

import org.apache.commons.io.FilenameUtils;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.bigbluebutton.presentation.messages.PresentationUploadToken;
import org.bigbluebutton.service.PresentationService;
import org.bigbluebutton.util.Pair;
import org.bigbluebutton.util.Util;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MimeType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.servlet.http.HttpServletRequest;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("v1")
public class PresentationControllerV1 implements PresentationApiV1 {

    private static final Logger logger = LoggerFactory.getLogger(PresentationControllerV1.class);

    private long maxFileSize;

    private final PresentationService presentationService;

    @Autowired
    public PresentationControllerV1(
            @Value("${bbb.presentation.maxFileSize") String maxFileSize,
            PresentationService presentationService
    ) {
        try {
            this.maxFileSize = Long.parseLong(maxFileSize);
        } catch(NumberFormatException e) {
            this.maxFileSize = 30000000L;
        }

        this.presentationService = presentationService;
    }

    @Override
    public ResponseEntity<String> checkPresentation(HttpServletRequest request) {
        String presentationToken = request.getHeader("x-presentation-token");
        long originalContentLength = 0L;

        try {
            originalContentLength = Long.parseLong(request.getHeader("x-original-content-length"));
        } catch(NumberFormatException e) {
            logger.error("Error in checkPresentationBeforeUploading.\n {}", e.getMessage());
        }

        if(presentationToken != null
                && presentationService.isPresentationTokenValid(presentationToken)
                && originalContentLength < maxFileSize
                && originalContentLength != 0
        ) {
            logger.info("SUCCESS");
            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.set("Cache-Control", "no-cache");
            return ResponseEntity
                    .ok()
                    .contentType(MediaType.TEXT_PLAIN)
                    .headers(responseHeaders)
                    .body("upload-success");
        }

        logger.info("NO SUCCESS");

        PresentationUploadToken uploadToken = presentationService.getPresentationUploadToken(presentationToken);
        presentationService.sendPresentationUploadMaxFileSizeMessage(uploadToken, (int) originalContentLength, (int) maxFileSize);

        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("Cache-Control", "no-cache");
        responseHeaders.set("x-file-too-large", "1");
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .contentType(MediaType.TEXT_PLAIN)
                .headers(responseHeaders)
                .body("file-empty");
    }

    @Override
    public ResponseEntity<String> upload(@RequestParam("fileUpload") MultipartFile file, HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();

        String presentationToken = params.get("authzToken")[0];
        String meetingId = params.get("conference")[0];

        if(presentationToken == null || !presentationService.isPresentationTokenValidAndExpired(presentationToken)) {
            logger.info("WARNING! AuthzToken={} was not valid in meetingId={}", presentationToken, meetingId);
            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.add("Cache-Control", "no-cache");
            return ResponseEntity.ok().headers(responseHeaders).contentType(MediaType.TEXT_PLAIN).body("invalid auth token");
        }

        if(Util.isMeetingIdValidFormat(meetingId)) {
            // TODO Retrieve meeting without using bbb-common-web
        } else {
            logger.info("Upload failed. Invalid meeting id format {}", meetingId);
            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.add("Cache-Control", "no-cache");
            return ResponseEntity
                    .ok()
                    .headers(responseHeaders)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("no-meeting");
        }

        boolean isDownloadable = Boolean.parseBoolean(params.get("is_downloadable")[0]);
        String podId = params.get("pod_id")[0];
        boolean current = false;
        if(params.containsKey("current")) current = Boolean.parseBoolean(params.get("current")[0]);

        logger.info("@Default presentation pod {}", podId);

        boolean uploadFailed = false;
        List<String> uploadFailedReasons = new ArrayList<>();
        String presOrigFileName = "";
        String presFileName = "";
        String fileNameExt = "";
        String presId = "";
        File pres = null;
        String tempPresId = params.get("temporaryPresentationId")[0];

        if(!file.isEmpty()) {
            presOrigFileName = file.getOriginalFilename();
            presFileName = FilenameUtils.getName(presOrigFileName);
            fileNameExt = FilenameUtils.getExtension(presFileName);
        } else {
            logger.warn("Upload failed. File empty.");
            uploadFailedReasons.add("uploaded_file_empty");
            uploadFailed = true;
        }

        if(Objects.equals(presFileName, "") || Objects.equals(fileNameExt, "")) {
            logger.debug("Upload failed. Invalid filename {}", presOrigFileName);
            uploadFailedReasons.add("invalid_filename");
            uploadFailed = true;
        } else {
            Pair<String, File> presentationIdFilePair = presentationService.movePresentationFile(file, presFileName, meetingId, fileNameExt);
            presId = presentationIdFilePair.getFirstItem();
            pres = presentationIdFilePair.getSecondItem();
        }

        logger.debug("Processing file upload {}", presFileName);
        UploadedPresentation uploadedPresentation = presentationService.generateUploadedPresentation(
                podId,
                meetingId,
                presId,
                tempPresId,
                presFileName,
                current,
                presentationToken,
                uploadFailed,
                uploadFailedReasons,
                isDownloadable
        );

        uploadedPresentation.setUploadedFile(pres);
        presentationService.processUploadedPresentation(uploadedPresentation);
        logger.debug("File upload success {}", presFileName);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add("Cache-Control", "no-cache");
        return ResponseEntity
                .ok()
                .headers(responseHeaders)
                .contentType(MediaType.TEXT_PLAIN)
                .body("upload-success");
    }

    @Override
    public ResponseEntity<Object> testConversion(HttpServletRequest request) {
        // TODO Implement testConversionProcess
        return null;
    }

    @Override
    public ResponseEntity<String> delegate(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        String presentationName = params.get("presentation_name")[0];
        String conference = params.get("conference")[0];
        String room = params.get("room")[0];
        String returnCode = params.get("returnCode")[0];
        String totalSlides = params.get("totalSlides")[0];
        String slidesCompleted = params.get("slidesCompleted")[0];

        // TODO Implement processDelegatedPresentation

        return null;
    }

    @Override
    public ResponseEntity<byte[]> showSlide(HttpServletRequest request) {
        logger.debug("############### HERE");

        Map<String, String[]> params = request.getParameterMap();
        String presentationName = params.get("presentation_name")[0];
        String conference = params.get("conference")[0];
        String room = params.get("room")[0];
        String slide = params.get("id")[0];

        logger.error("Nginx should be serving this SWF file! meetingId={},presId={},page={}",conference, presentationName, slide);

        try {
            File presentation = presentationService.showSlide(conference, room, presentationName, slide);
            if (presentation.exists()) {
                logger.debug("###### SLIDE FOUND ######");
                byte[] bytes = Files.readAllBytes(presentation.toPath());
                HttpHeaders responseHeaders = new HttpHeaders();
                responseHeaders.add("Cache-Control", "no-cache");
                return ResponseEntity
                        .ok()
                        .headers(responseHeaders)
                        .contentType(MediaType.parseMediaType("application/x-shockwave-flash"))
                        .body(bytes);
            } else {
                logger.debug("###### SLIDE NNOOOOOOT FOUND ######");
            }
        } catch (IOException e) {
            logger.error("Failed to read SWF file. meetingId=" + conference + ",presId=" + presentationName + ",page=" + slide);
            logger.error("Error reading SWF file.\n" + e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new byte[] {});
    }

    @Override
    public ResponseEntity<byte[]> showSvg(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();

        String presentationName = params.get("presentation_name")[0];
        String conference = params.get("conference")[0];
        String room = params.get("room")[0];
        String svg = params.get("id")[0];

        logger.error("Nginx should be serving this SVG file! meetingId={},presId={},page={}",conference, presentationName, svg);

        try {
            File presentation = presentationService.showSvgImage(conference, room, presentationName, svg);
            if (presentation.exists()) {
                byte[] bytes = Files.readAllBytes(presentation.toPath());
                HttpHeaders responseHeaders = new HttpHeaders();
                responseHeaders.add("Cache-Control", "no-cache");
                return ResponseEntity.ok().headers(responseHeaders).contentType(MediaType.parseMediaType("image/svg+xml")).body(bytes);
            }
        } catch (IOException e) {
            logger.error("Failed to read SVG file. meetingId=" + conference + ",presId=" + presentationName + ",page=" + svg);
            logger.error("Error reading SVG file.\n" + e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new byte[] {});
    }

    @Override
    public ResponseEntity<byte[]> showThumbnail(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();

        String presentationName = params.get("presentation_name")[0];
        String conference = params.get("conference")[0];
        String room = params.get("room")[0];
        String thumbnail = params.get("id")[0];

        logger.error("Nginx should be serving this thumb file! meetingId={},presId={},page={}",conference, presentationName, thumbnail);

        try {
            File presentation = presentationService.showThumbnail(conference, room, presentationName, thumbnail);
            if (presentation.exists()) {
                byte[] bytes = Files.readAllBytes(presentation.toPath());
                HttpHeaders responseHeaders = new HttpHeaders();
                responseHeaders.add("Cache-Control", "no-cache");
                return ResponseEntity.ok().headers(responseHeaders).contentType(MediaType.parseMediaType("image")).body(bytes);
            }
        } catch (IOException e) {
            logger.error("Failed to read thumb file. meetingId=" + conference + ",presId=" + presentationName + ",page=" + thumbnail);
            logger.error("Error reading thumb file.\n" + e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new byte[] {});
    }

    @Override
    public ResponseEntity<byte[]> showPng(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();

        String presentationName = params.get("presentation_name")[0];
        String conference = params.get("conference")[0];
        String room = params.get("room")[0];
        String png = params.get("id")[0];

        try {
            File presentation = presentationService.showPng(conference, room, presentationName, png);
            if (presentation.exists()) {
                byte[] bytes = Files.readAllBytes(presentation.toPath());
                HttpHeaders responseHeaders = new HttpHeaders();
                responseHeaders.add("Cache-Control", "no-cache");
                return ResponseEntity.ok().headers(responseHeaders).contentType(MediaType.parseMediaType("image")).body(bytes);
            }
        } catch (IOException e) {
            logger.error("Error reading file.\n" + e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new byte[] {});
    }

    @Override
    public ResponseEntity<byte[]> showTextFile(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();

        String presentationName = params.get("presentation_name")[0];
        String conference = params.get("conference")[0];
        String room = params.get("room")[0];
        String file = params.get("id")[0];

        logger.debug("Controller: Show textfile request for {} {}", presentationName, file);
        logger.error("Nginx should be serving this text file! meetingId={},presId={},page={}", conference, presentationName, file);

        try {
            File presentation = presentationService.showTextFile(conference, room, presentationName, file);
            if (presentation.exists()) {
                byte[] bytes = Files.readAllBytes(presentation.toPath());
                HttpHeaders responseHeaders = new HttpHeaders();
                responseHeaders.add("Cache-Control", "no-cache");
                return ResponseEntity.ok().headers(responseHeaders).contentType(MediaType.parseMediaType("image/svg+xml")).body(bytes);
            }
        } catch (IOException e) {
            logger.error("Failed to read SVG file. meetingId=" + conference + ",presId=" + presentationName + ",page=" + file);
            logger.error("Error reading SVG file.\n" + e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new byte[] {});
    }

    @Override
    public ResponseEntity<byte[]> downloadFile(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        String presId = params.get("presId")[0];
        String presFilename = params.get("presFilename")[0];
        String meetingId = params.get("meetingId")[0];

        logger.debug("Controller: Download request for {}", presFilename);

        try {
            File pres = presentationService.getDownloadablePresentationFile(meetingId, presId, presFilename);
            if (pres != null && pres.exists()) {
                logger.debug("Controller: Sending pdf reply for $presFilename");

                byte[] bytes = Files.readAllBytes(pres.toPath());
                String responseName = pres.getName();
                MimeType mimeType = MimeType.valueOf(Files.probeContentType(pres.toPath()));
                String mimeName = mimeType.getType();

                HttpHeaders responseHeaders = new HttpHeaders();
                responseHeaders.add("content-disposition", "attachment; filename=" + URLEncoder.encode(responseName, StandardCharsets.UTF_8.name()));
                responseHeaders.add("Cache-Control", "no-cache");

                return ResponseEntity
                        .ok()
                        .headers(responseHeaders)
                        .contentType(MediaType.parseMediaType(mimeName))
                        .body(bytes);
            } else {
                logger.warn("{} does not exist.", pres);
            }
        } catch (IOException e) {
            logger.error("Error reading file.\n" + e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new byte[] {});
    }

    @Override
    public ResponseEntity<String> numSlides(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        String presentationName = params.get("presentation_name")[0];
        String conference = params.get("conference")[0];
        String room = params.get("room")[0];

        int numThumbs = presentationService.numberOfThumbnails(conference, room, presentationName);

        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add("Cache-Control", "no-cache");
        Document document = constructXmlResponse(conference, room, presentationName);

        String response = "";

        if(document != null) {
            Element presentationElement = (Element) document.getElementsByTagName("presentation").item(0);

            Element slidesElement = document.createElement("slides");
            slidesElement.setAttribute("count", String.valueOf(numThumbs));

            for(int i = 0; i <= numThumbs; i++) {
                Element element = document.createElement("slide");
                element.setAttribute("number", String.valueOf(i));
                element.setAttribute("name", "slide/" + i);
                element.setAttribute("thumb", "thumbnail/" + i);
                element.setAttribute("textfile", "textfile/" + i);
                slidesElement.appendChild(element);
            }

            presentationElement.appendChild(slidesElement);
            response = documentToString(document);
        }

        return ResponseEntity
                .ok()
                .headers(responseHeaders)
                .body(response);
    }

    @Override
    public ResponseEntity<String> numThumbnails(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        String presentationName = params.get("presentation_name")[0];
        String conference = params.get("conference")[0];
        String room = params.get("room")[0];

        int numThumbs = presentationService.numberOfThumbnails(conference, room, presentationName);

        Document document = constructXmlResponse(conference, room, presentationName);

        String response = "";

        if(document != null) {
            Element presentationElement = (Element) document.getElementsByTagName("presentation").item(0);

            Element slidesElement = document.createElement("thumbnails");
            slidesElement.setAttribute("count", String.valueOf(numThumbs));

            for(int i = 0; i <= numThumbs; i++) {
                Element element = document.createElement("thumb");
                element.setAttribute("name", "thumbnails/" + i);
                slidesElement.appendChild(element);
            }

            presentationElement.appendChild(slidesElement);
            response = documentToString(document);
        }

        return ResponseEntity
                .ok()
                .body(response);
    }

    @Override
    public ResponseEntity<String> numSvgs(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        String presentationName = params.get("presentation_name")[0];
        String conference = params.get("conference")[0];
        String room = params.get("room")[0];

        int numThumbs = presentationService.numberOfSvgs(conference, room, presentationName);

        Document document = constructXmlResponse(conference, room, presentationName);

        String response = "";

        if(document != null) {
            Element presentationElement = (Element) document.getElementsByTagName("presentation").item(0);

            Element slidesElement = document.createElement("thumbnails");
            slidesElement.setAttribute("count", String.valueOf(numThumbs));

            for(int i = 0; i <= numThumbs; i++) {
                Element element = document.createElement("thumb");
                element.setAttribute("name", "thumbnails/" + i);
                slidesElement.appendChild(element);
            }

            presentationElement.appendChild(slidesElement);
            response = documentToString(document);
        }

        return ResponseEntity
                .ok()
                .body(response);
    }

    @Override
    public ResponseEntity<String> numTextFiles(HttpServletRequest request) {
        Map<String, String[]> params = request.getParameterMap();
        String presentationName = params.get("presentation_name")[0];
        String conference = params.get("conference")[0];
        String room = params.get("room")[0];

        int numThumbs = presentationService.numberOfTextFiles(conference, room, presentationName);

        Document document = constructXmlResponse(conference, room, presentationName);

        String response = "";

        if(document != null) {
            Element presentationElement = (Element) document.getElementsByTagName("presentation").item(0);

            Element slidesElement = document.createElement("thumbnails");
            slidesElement.setAttribute("count", String.valueOf(numThumbs));

            for(int i = 0; i <= numThumbs; i++) {
                Element element = document.createElement("thumb");
                element.setAttribute("name", "textfiles/" + i);
                slidesElement.appendChild(element);
            }

            presentationElement.appendChild(slidesElement);
            response = documentToString(document);
        }

        return ResponseEntity
                .ok()
                .body(response);
    }

    private Document constructXmlResponse(String conference, String room, String presentationName) {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();

        try {
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.newDocument();

            Element conferenceElement = document.createElement("conference");
            conferenceElement.setAttribute("id", conference);
            conferenceElement.setAttribute("room", room);

            Element presentationElement = document.createElement("presentation");
            presentationElement.setAttribute("name", presentationName);
            conferenceElement.appendChild(presentationElement);

            document.appendChild(conferenceElement);
            return document;
        } catch(Exception e) {
            logger.error("{}", e.getMessage());
        }

        return null;
    }

    private String documentToString(Document document) {
        String output = null;

        try {
            TransformerFactory factory = TransformerFactory.newInstance();
            Transformer transformer = factory.newTransformer();
            transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
            transformer.setOutputProperty(OutputKeys.INDENT, "no");
            StringWriter writer = new StringWriter();
            transformer.transform(new DOMSource(document), new StreamResult(writer));
            output = writer.toString();
        } catch(Exception e) {
            e.printStackTrace();
        }

        return output;
    }
}
