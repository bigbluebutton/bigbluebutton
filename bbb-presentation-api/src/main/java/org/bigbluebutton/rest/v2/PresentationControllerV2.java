package org.bigbluebutton.rest.v2;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import org.apache.commons.io.FilenameUtils;
import org.bigbluebutton.dto.ConferenceDto;
import org.bigbluebutton.dto.ContentDto;
import org.bigbluebutton.dto.ItemDto;
import org.bigbluebutton.dto.PresentationDto;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.bigbluebutton.presentation.messages.PresentationUploadToken;
import org.bigbluebutton.request.PresentationUploadInfo;
import org.bigbluebutton.response.Response;
import org.bigbluebutton.response.ResponseEnvelope;
import org.bigbluebutton.response.error.Error;
import org.bigbluebutton.response.error.Errors;
import org.bigbluebutton.response.payload.BytesPayload;
import org.bigbluebutton.response.payload.ConferencePayload;
import org.bigbluebutton.service.PresentationService;
import org.bigbluebutton.util.Pair;
import org.bigbluebutton.util.Util;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.hateoas.config.EnableHypermediaSupport;
import org.springframework.hateoas.config.EnableHypermediaSupport.HypermediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MimeType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.io.File;
import java.io.IOException;
import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.lang.reflect.Proxy;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@ConditionalOnProperty("bbb.api.v2.enabled")
@RequestMapping("/v2/presentations")
@EnableHypermediaSupport(type = HypermediaType.HAL)
public class PresentationControllerV2 implements PresentationApiV2 {

    private static final Logger logger = LoggerFactory.getLogger(PresentationControllerV2.class);

    private long maxFileSize;

    private final PresentationService presentationService;

    @Autowired
    public PresentationControllerV2(
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
    public ResponseEntity<Response> checkPresentation(
            @Parameter(in = ParameterIn.PATH, description = "Unique presentation token", required = true) @PathVariable("token") String token,
            @Parameter(in = ParameterIn.QUERY, description = "Original content length", required = true) @RequestParam("length") String length
    ) {
        ResponseEnvelope response = new ResponseEnvelope();
        long originalContentLength = 0L;

        try {
            originalContentLength = Long.parseLong(length);
        } catch(NumberFormatException e) {
            logger.error("Error in checkPresentationBeforeUploading.\n {}", e.getMessage());
        }

        if(token != null
                && presentationService.isPresentationTokenValid(token)
                && originalContentLength < maxFileSize
                && originalContentLength != 0
        ) {
            logger.info("SUCCESS");
            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.set("Cache-Control", "no-cache");
            return ResponseEntity
                    .ok()
                    .headers(responseHeaders)
                    .body(response);
        }

        logger.info("NO SUCCESS");

        PresentationUploadToken uploadToken = presentationService.getPresentationUploadToken(token);
        presentationService.sendPresentationUploadMaxFileSizeMessage(uploadToken, (int) originalContentLength, (int) maxFileSize);

        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("Cache-Control", "no-cache");
        responseHeaders.set("x-file-too-large", "1");

        Errors errors = new Errors();
        errors.addError(Error.EMPTY_FILE_ERROR);
        response.setErrors(errors);

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .headers(responseHeaders)
                .body(response);
    }

    @Override
    public ResponseEntity<Response> uploadPresentation(
            @RequestPart(value = "info") @Valid PresentationUploadInfo info,
            @RequestPart(value = "file") MultipartFile file
    ) {
        ResponseEnvelope response = new ResponseEnvelope();

        if(info.getToken() == null || !presentationService.isPresentationTokenValidAndExpired(info.getToken())) {
            logger.info("WARNING! AuthzToken={} was not valid in meetingId={}", info.getToken(), info.getMeetingId());
            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.add("Cache-Control", "no-cache");

            Errors errors = new Errors();
            errors.addError(Error.INVALID_TOKEN);
            response.setErrors(errors);

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .headers(responseHeaders)
                    .body(response);
        }

        if(Util.isMeetingIdValidFormat(info.getMeetingId())) {
            // TODO Retrieve meeting without using bbb-common-web
        } else {
            logger.info("Upload failed. Invalid meeting id format {}", info.getMeetingId());
            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.add("Cache-Control", "no-cache");

            Errors errors = new Errors();
            errors.addError(Error.UPLOAD_FAILED);

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .headers(responseHeaders)
                    .body(response);
        }

        boolean current = info.getCurrent() != null && info.getCurrent();

        logger.info("@Default presentation pod {}", info.getPodId());

        boolean uploadFailed = false;
        List<String> uploadFailedReasons = new ArrayList<>();
        String presOrigFileName = "";
        String presFileName = "";
        String fileNameExt = "";
        String presId = "";
        File pres = null;

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
            Pair<String, File> presentationIdFilePair = presentationService.movePresentationFile(file, presFileName, info.getMeetingId(), fileNameExt);
            presId = presentationIdFilePair.getFirstItem();
            pres = presentationIdFilePair.getSecondItem();
        }

        logger.debug("Processing file upload {}", presFileName);
        UploadedPresentation uploadedPresentation = presentationService.generateUploadedPresentation(
                info.getPodId(),
                info.getMeetingId(),
                presId,
                info.getTempPresentationId(),
                presFileName,
                current,
                info.getToken(),
                uploadFailed,
                uploadFailedReasons,
                info.getIsDownloadable()
        );

        uploadedPresentation.setUploadedFile(pres);
        presentationService.processUploadedPresentation(uploadedPresentation);
        logger.debug("File upload success {}", presFileName);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add("Cache-Control", "no-cache");
        return ResponseEntity
                .ok()
                .headers(responseHeaders)
                .body(response);
    }

    @Override
    public ResponseEntity<Response> numSlides(
            @Parameter(in = ParameterIn.PATH, description = "Conference the presentation belongs to", required = true) @PathVariable("conference") String conference,
            @Parameter(in = ParameterIn.PATH, description = "Room in the conference", required = true) @PathVariable("room") String room,
            @Parameter(in = ParameterIn.PATH, description = "Name of the presentation", required = true) @PathVariable("name") String name
    ) {
        ResponseEnvelope response = new ResponseEnvelope();
        int numThumbs = presentationService.numberOfThumbnails(conference, room, name);

        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add("Cache-Control", "no-cache");

        List<ItemDto> itemDtos = new ArrayList<>();
        for(int i = 0; i < numThumbs; i++) {
            ItemDto itemDto = new ItemDto();
            itemDto.setNumber(String.valueOf(i));
            itemDto.setName("slide/" + i);
            itemDto.setThumb("thumbnail/" + i);
            itemDto.setTextFile("textfile/" + i);
            itemDtos.add(itemDto);
        }

        ConferenceDto conferenceDto = createConferenceDto(conference, room, name, numThumbs, "slides", "slide", itemDtos);

        ConferencePayload payload = new ConferencePayload();
        payload.setConference(conferenceDto);
        response.setPayload(payload);

        return ResponseEntity
                .ok()
                .headers(responseHeaders)
                .body(response);
    }

    @Override
    public ResponseEntity<Response> showSlide(String conference, String room, String name, String slide) {
        logger.error("Nginx should be serving this SWF file! meetingId={},presId={},page={}",conference, name, slide);

        ResponseEnvelope response = new ResponseEnvelope();

        try {
            File presentation = presentationService.showSlide(conference, room, name, slide);
            if (presentation.exists()) {
                logger.debug("###### SLIDE FOUND ######");
                byte[] bytes = Files.readAllBytes(presentation.toPath());
                HttpHeaders responseHeaders = new HttpHeaders();
                responseHeaders.add("Cache-Control", "no-cache");
                BytesPayload payload = new BytesPayload();
                payload.setBytes(bytes);
                response.setPayload(payload);
                return ResponseEntity
                        .ok()
                        .headers(responseHeaders)
                        .contentType(MediaType.parseMediaType("application/x-shockwave-flash"))
                        .body(response);
            } else {
                logger.debug("###### SLIDE NNOOOOOOT FOUND ######");
                Errors errors = new Errors();
                errors.addError(Error.FILE_NOT_FOUND);
                response.setErrors(errors);
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
        } catch (IOException e) {
            logger.error("Failed to read SWF file. meetingId=" + conference + ",presId=" + name + ",page=" + slide);
            logger.error("Error reading SWF file.\n" + e.getMessage());
            Errors errors = new Errors();
            errors.addError(Error.FILE_READ_FAILED);
            response.setErrors(errors);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<Response> numSvgs(String conference, String room, String name) {
        ResponseEnvelope response = new ResponseEnvelope();
        int numThumbs = presentationService.numberOfThumbnails(conference, room, name);

        List<ItemDto> itemDtos = new ArrayList<>();
        for(int i = 0; i < numThumbs; i++) {
            ItemDto itemDto = new ItemDto();
            itemDto.setName("svgs/" + i);
            itemDtos.add(itemDto);
        }

        ConferenceDto conferenceDto = createConferenceDto(conference, room, name, numThumbs, "svgs", "svg", itemDtos);

        ConferencePayload payload = new ConferencePayload();
        payload.setConference(conferenceDto);
        response.setPayload(payload);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Response> showSvg(String conference, String room, String name, String svg) {
        logger.error("Nginx should be serving this SVG file! meetingId={},presId={},page={}",conference, name, svg);

        ResponseEnvelope response = new ResponseEnvelope();

        try {
            File presentation = presentationService.showSvgImage(conference, room, name, svg);
            if (presentation.exists()) {
                byte[] bytes = Files.readAllBytes(presentation.toPath());
                HttpHeaders responseHeaders = new HttpHeaders();
                responseHeaders.add("Cache-Control", "no-cache");
                BytesPayload payload = new BytesPayload();
                payload.setBytes(bytes);
                response.setPayload(payload);
                return ResponseEntity
                        .ok()
                        .headers(responseHeaders)
                        .contentType(MediaType.parseMediaType("image/svg+xml"))
                        .body(response);
            } else {
                Errors errors = new Errors();
                errors.addError(Error.FILE_NOT_FOUND);
                response.setErrors(errors);
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
        } catch (IOException e) {
            logger.error("Failed to read SVG file. meetingId=" + conference + ",presId=" + name + ",page=" + svg);
            logger.error("Error reading SVG file.\n" + e.getMessage());
            Errors errors = new Errors();
            errors.addError(Error.FILE_READ_FAILED);
            response.setErrors(errors);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<Response> numThumbnails(String conference, String room, String name) {
        ResponseEnvelope response = new ResponseEnvelope();
        int numThumbs = presentationService.numberOfThumbnails(conference, room, name);

        List<ItemDto> itemDtos = new ArrayList<>();
        for(int i = 0; i < numThumbs; i++) {
            ItemDto itemDto = new ItemDto();
            itemDto.setName("thumbnails/" + i);
            itemDtos.add(itemDto);
        }

        ConferenceDto conferenceDto = createConferenceDto(conference, room, name, numThumbs, "thumbnails", "thumb", itemDtos);

        ConferencePayload payload = new ConferencePayload();
        payload.setConference(conferenceDto);
        response.setPayload(payload);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Response> showThumbnail(String conference, String room, String name, String thumbnail) {
        logger.error("Nginx should be serving this thumb file! meetingId={},presId={},page={}",conference, name, thumbnail);

        ResponseEnvelope response = new ResponseEnvelope();

        try {
            File presentation = presentationService.showThumbnail(conference, room, name, thumbnail);
            if (presentation.exists()) {
                byte[] bytes = Files.readAllBytes(presentation.toPath());
                HttpHeaders responseHeaders = new HttpHeaders();
                responseHeaders.add("Cache-Control", "no-cache");
                BytesPayload payload = new BytesPayload();
                payload.setBytes(bytes);
                response.setPayload(payload);
                return ResponseEntity
                        .ok()
                        .headers(responseHeaders)
                        .contentType(MediaType.parseMediaType("image"))
                        .body(response);
            } else {
                Errors errors = new Errors();
                errors.addError(Error.FILE_NOT_FOUND);
                response.setErrors(errors);
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
        } catch (IOException e) {
            logger.error("Failed to read thumb file. meetingId=" + conference + ",presId=" + name + ",page=" + thumbnail);
            logger.error("Error reading thumb file.\n" + e.getMessage());
            Errors errors = new Errors();
            errors.addError(Error.FILE_READ_FAILED);
            response.setErrors(errors);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<Response> showPng(String conference, String room, String name, String png) {
        logger.error("Nginx should be serving this PNG file! meetingId={},presId={},page={}",conference, name, png);

        ResponseEnvelope response = new ResponseEnvelope();

        try {
            File presentation = presentationService.showPng(conference, room, name, png);
            if (presentation.exists()) {
                byte[] bytes = Files.readAllBytes(presentation.toPath());
                HttpHeaders responseHeaders = new HttpHeaders();
                responseHeaders.add("Cache-Control", "no-cache");
                BytesPayload payload = new BytesPayload();
                payload.setBytes(bytes);
                response.setPayload(payload);
                return ResponseEntity
                        .ok()
                        .headers(responseHeaders)
                        .contentType(MediaType.parseMediaType("image"))
                        .body(response);
            } else {
                Errors errors = new Errors();
                errors.addError(Error.FILE_NOT_FOUND);
                response.setErrors(errors);
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
        } catch (IOException e) {
            logger.error("Failed to read PNG file. meetingId=" + conference + ",presId=" + name + ",page=" + png);
            logger.error("Error reading PNG file.\n" + e.getMessage());
            Errors errors = new Errors();
            errors.addError(Error.FILE_READ_FAILED);
            response.setErrors(errors);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<Response> numTextFiles(String conference, String room, String name) {
        ResponseEnvelope response = new ResponseEnvelope();
        int numThumbs = presentationService.numberOfThumbnails(conference, room, name);

        List<ItemDto> itemDtos = new ArrayList<>();
        for(int i = 0; i < numThumbs; i++) {
            ItemDto itemDto = new ItemDto();
            itemDto.setName("textfiles/" + i);
            itemDtos.add(itemDto);
        }

        ConferenceDto conferenceDto = createConferenceDto(conference, room, name, numThumbs, "textfiles", "textfile", itemDtos);

        ConferencePayload payload = new ConferencePayload();
        payload.setConference(conferenceDto);
        response.setPayload(payload);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Response> showTextFile(String conference, String room, String name, String file) {
        logger.debug("Controller: Show textfile request for {} {}", name, file);
        logger.error("Nginx should be serving this text file! meetingId={},presId={},page={}",conference, name, file);

        ResponseEnvelope response = new ResponseEnvelope();

        try {
            File presentation = presentationService.showTextFile(conference, room, name, file);
            if (presentation.exists()) {
                byte[] bytes = Files.readAllBytes(presentation.toPath());
                HttpHeaders responseHeaders = new HttpHeaders();
                responseHeaders.add("Cache-Control", "no-cache");
                BytesPayload payload = new BytesPayload();
                payload.setBytes(bytes);
                response.setPayload(payload);
                return ResponseEntity
                        .ok()
                        .headers(responseHeaders)
                        .contentType(MediaType.parseMediaType("image"))
                        .body(response);
            } else {
                Errors errors = new Errors();
                errors.addError(Error.FILE_NOT_FOUND);
                response.setErrors(errors);
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
        } catch (IOException e) {
            logger.error("Failed to read text file. meetingId=" + conference + ",presId=" + name + ",page=" + file);
            logger.error("Error reading text file.\n" + e.getMessage());
            Errors errors = new Errors();
            errors.addError(Error.FILE_READ_FAILED);
            response.setErrors(errors);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<Response> downloadFile(String meeting, String id, String name) {
        logger.debug("Controller: Download request for {}", name);

        ResponseEnvelope response = new ResponseEnvelope();

        try {
            File pres = presentationService.getDownloadablePresentationFile(meeting, id, name);
            if (pres != null && pres.exists()) {
                logger.debug("Controller: Sending pdf reply for {}", name);

                byte[] bytes = Files.readAllBytes(pres.toPath());
                String responseName = pres.getName();
                MimeType mimeType = MimeType.valueOf(Files.probeContentType(pres.toPath()));
                String mimeName = mimeType.getType();

                HttpHeaders responseHeaders = new HttpHeaders();
                responseHeaders.add("content-disposition", "attachment; filename=" + URLEncoder.encode(responseName, StandardCharsets.UTF_8.name()));
                responseHeaders.add("Cache-Control", "no-cache");

                BytesPayload payload = new BytesPayload();
                payload.setBytes(bytes);
                response.setPayload(payload);
                return ResponseEntity
                        .ok()
                        .headers(responseHeaders)
                        .contentType(MediaType.parseMediaType(mimeName))
                        .body(response);
            } else {
                logger.warn("{} does not exist.", pres);
                Errors errors = new Errors();
                errors.addError(Error.FILE_NOT_FOUND);
                response.setErrors(errors);
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
        } catch (IOException e) {
            logger.error("Error reading file.\n" + e.getMessage());
            Errors errors = new Errors();
            errors.addError(Error.FILE_READ_FAILED);
            response.setErrors(errors);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private ConferenceDto createConferenceDto(String conference, String room, String name, int num, String contentName,
                                              String itemName, List<ItemDto> itemDtos) {
        ConferenceDto conferenceDto = new ConferenceDto();
        conferenceDto.setId(conference);
        conferenceDto.setRoom(room);

        PresentationDto presentationDto = new PresentationDto();
        presentationDto.setName(name);

        ContentDto contentDto = new ContentDto();
        contentDto.setCount(num);
        contentDto.setItems(itemDtos);

        presentationDto.setContent(contentDto);
        conferenceDto.setPresentation(presentationDto);

        try {
            Field contentField = presentationDto.getClass().getDeclaredField("content");
            contentField.setAccessible(true);

            final JacksonXmlProperty contentJacksonAnnotation = contentField.getAnnotation(JacksonXmlProperty.class);
            changeAnnotationValue(contentJacksonAnnotation, "localName", contentName);

            final JsonProperty contentJsonAnnotation = contentField.getAnnotation(JsonProperty.class);
            changeAnnotationValue(contentJsonAnnotation, "value", contentName);

            Field itemField = contentDto.getClass().getDeclaredField("items");
            itemField.setAccessible(true);
            final JacksonXmlProperty itemJacksonAnnotation = itemField.getAnnotation(JacksonXmlProperty.class);
            changeAnnotationValue(itemJacksonAnnotation, "localName", itemName);

        } catch(Exception e) {
            e.printStackTrace();
        }

        return conferenceDto;
    }

    private static void changeAnnotationValue(Annotation annotation, String key, Object newValue) {
        Object handler = Proxy.getInvocationHandler(annotation);

        Field field;
        try {
            field = handler.getClass().getDeclaredField("memberValues");
        } catch(Exception e) {
            e.printStackTrace();
            return;
        }

        field.setAccessible(true);
        Map<String, Object> memberValues;

        try {
            memberValues = (Map<String, Object>) field.get(handler);
        } catch(Exception e) {
            e.printStackTrace();
            return;
        }

        Object oldValue = memberValues.get(key);
        if(oldValue == null || oldValue.getClass() != newValue.getClass()) {
            logger.error("The class of the new annotation value does not match the old annotation value class");
            return;
        }

        memberValues.put(key, newValue);
    }
}
