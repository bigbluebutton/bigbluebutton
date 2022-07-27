package org.bigbluebutton.rest.v1;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang3.LocaleUtils;
import org.bigbluebutton.dao.entity.Events;
import org.bigbluebutton.dao.entity.Recording;
import org.bigbluebutton.dao.entity.Track;
import org.bigbluebutton.request.MetadataParams;
import org.bigbluebutton.response.Response;
import org.bigbluebutton.response.ResponseV1;
import org.bigbluebutton.response.content.MessageContent;
import org.bigbluebutton.response.content.TrackContent;
import org.bigbluebutton.response.model.TrackModel;
import org.bigbluebutton.service.RecordingService;
import org.bigbluebutton.service.XmlService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1")
public class RecordingApiControllerV1 implements RecordingApiV1 {

    private static final Logger logger = LoggerFactory.getLogger(RecordingApiControllerV1.class);

    private String securitySalt;

    private final Map<String, RecordingService> recordingServicesByType;
    private final RecordingService recordingService;
    private final XmlService xmlService;

    @Autowired
    public RecordingApiControllerV1(List<RecordingService> recordingServices, XmlService xmlService,
            @Value("${bbb.security.salt}") String securitySalt,
            @Value("${bbb.api.recording.impl}") String recordingServiceImpl) {
        recordingServicesByType = recordingServices.stream()
                .collect(Collectors.toMap(RecordingService::getType, Function.identity()));
        recordingService = this.recordingServicesByType.get(recordingServiceImpl);
        this.xmlService = xmlService;
        this.securitySalt = securitySalt;
    }

    @Override
    public String getRecordings(HttpServletRequest request) {
        List<String> meetingIds = new ArrayList<>();
        List<String> recordIds = new ArrayList<>();
        List<String> states = new ArrayList<>();
        Map<String, String> meta = new HashMap<>();
        int page = 0;
        int size = 10;
        String checksum = null;

        Map<String, String[]> params = request.getParameterMap();

        if (params.containsKey("meetingID"))
            meetingIds.addAll(Arrays.asList(params.get("meetingID")));
        if (params.containsKey("recordID"))
            recordIds.addAll(Arrays.asList(params.get("recordID")));
        if (params.containsKey("state"))
            states.addAll(Arrays.asList(params.get("state")));
        if (params.containsKey("checksum"))
            checksum = params.get("checksum")[0];

        if (params.containsKey("page")) {
            try {
                page = Integer.parseInt(params.get("page")[0]);
            } catch (NumberFormatException ignored) {
            }
        }

        if (params.containsKey("size")) {
            try {
                size = Integer.parseInt(params.get("size")[0]);
            } catch (NumberFormatException ignored) {
            }
        }

        for (Map.Entry<String, String[]> entry : params.entrySet()) {
            if (MetadataParams.isMetaValid(entry.getKey()))
                meta.put(entry.getKey(), entry.getValue()[0]);
        }

        meta = MetadataParams.processMetaParams(meta);

        if (!validateChecksum("getRecordings", checksum, request.getQueryString())) {
            return xmlService.constructGenericResponse(new String[] { "returnCode", "messageKey", "message" },
                    new String[] { "FAILED", "checksumError", "You did not pass the checksum security check" });
        }

        List<Recording> recordings = recordingService.searchRecordings(meetingIds, recordIds, states, meta);

        Pageable pageable = PageRequest.of(page, size);
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), recordings.size());
        Page<Recording> recordingPage = new PageImpl<>(recordings.subList(start, end), pageable, recordings.size());

        String recordingsXml = xmlService.recordingsToXml(recordingPage.getContent());
        String response = xmlService.constructResponseFromXml(recordingsXml);
        return xmlService.constructPaginatedResponse(recordingPage, response);
    }

    @Override
    public String publishRecordings(HttpServletRequest request) {
        List<String> recordIds = new ArrayList<>();
        boolean publish = false;
        String checksum = null;

        Map<String, String[]> params = request.getParameterMap();

        if (params.containsKey("recordID"))
            recordIds.addAll(Arrays.asList(params.get("recordID")));

        if (params.containsKey("publish")) {
            String p = params.get("publish")[0];
            if (p.equalsIgnoreCase("true"))
                publish = true;
            else if (p.equalsIgnoreCase("false"))
                publish = false;
            else {
                return xmlService.constructGenericResponse(new String[] { "returnCode", "messageKey", "message" },
                        new String[] { "FAILED", "missingParamPublish",
                                "You must specify a publish value true or false." });
            }
        }

        if (params.containsKey("checksum"))
            checksum = params.get("checksum")[0];

        if (!validateChecksum("publishRecordings", checksum, request.getQueryString())) {
            return xmlService.constructGenericResponse(new String[] { "returnCode", "messageKey", "message" },
                    new String[] { "FAILED", "checksumError", "You did not pass the checksum security check" });
        }

        List<Recording> recordings = new ArrayList<>();
        for (String id : recordIds) {
            Recording recording = recordingService.publishRecording(id, publish);
            if (recording != null)
                recordings.add(recording);
        }

        if (recordings.size() == 0) {
            return xmlService.constructGenericResponse(new String[] { "returnCode", "messageKey", "message" },
                    new String[] { "FAILED", "notFound", "We could not find any recordings" });
        } else
            return xmlService.constructGenericResponse(new String[] { "returnCode", "published" },
                    new String[] { "SUCCESS", String.valueOf(publish) });
    }

    @Override
    public String deleteRecordings(HttpServletRequest request) {
        List<String> recordIds = new ArrayList<>();
        String checksum = null;

        Map<String, String[]> params = request.getParameterMap();

        if (params.containsKey("recordID"))
            recordIds.addAll(Arrays.asList(params.get("recordID")));
        if (params.containsKey("checksum"))
            checksum = params.get("checksum")[0];

        if (!validateChecksum("deleteRecordings", checksum, request.getQueryString())) {
            return xmlService.constructGenericResponse(new String[] { "returnCode", "messageKey", "message" },
                    new String[] { "FAILED", "checksumError", "You did not pass the checksum security check" });
        }

        List<Boolean> deletions = new ArrayList<>();
        for (String id : recordIds) {
            boolean wasDeleted = recordingService.deleteRecording(id);
            if (wasDeleted)
                deletions.add(true);
        }

        if (deletions.size() == 0) {
            return xmlService.constructGenericResponse(new String[] { "returnCode", "messageKey", "message" },
                    new String[] { "FAILED", "notFound", "We could not find any recordings" });
        } else {
            return xmlService.constructGenericResponse(new String[] { "returnCode", "deleted" },
                    new String[] { "SUCCESS", "true" });
        }
    }

    @Override
    public String updateRecordings(HttpServletRequest request) {
        List<String> recordIds = new ArrayList<>();
        Map<String, String> meta = new HashMap<>();
        String checksum = null;

        Map<String, String[]> params = request.getParameterMap();

        if (params.containsKey("recordID"))
            recordIds.addAll(Arrays.asList(params.get("recordID")));
        if (params.containsKey("checksum"))
            checksum = params.get("checksum")[0];

        for (Map.Entry<String, String[]> entry : params.entrySet()) {
            if (MetadataParams.isMetaValid(entry.getKey()))
                meta.put(entry.getKey(), entry.getValue()[0]);
        }

        meta = MetadataParams.processMetaParams(meta);

        if (!validateChecksum("updateRecordings", checksum, request.getQueryString())) {
            return xmlService.constructGenericResponse(new String[] { "returnCode", "messageKey", "message" },
                    new String[] { "FAILED", "checksumError", "You did not pass the checksum security check" });
        }

        List<Recording> recordings = new ArrayList<>();
        for (String id : recordIds) {
            Recording recording = recordingService.updateRecording(id, meta);
            if (recording != null)
                recordings.add(recording);
        }

        if (recordings.size() == 0) {
            return xmlService.constructGenericResponse(new String[] { "returnCode", "messageKey", "message" },
                    new String[] { "FAILED", "notFound", "We could not find any recordings" });
        } else
            return xmlService.constructGenericResponse(new String[] { "returnCode", "updated" },
                    new String[] { "SUCCESS", "true" });
    }

    @Override
    public ResponseEntity<Response> getRecordingTextTracks(HttpServletRequest request) {
        ResponseV1 response = new ResponseV1();

        String recordId = null;
        String checksum = null;
        int page = 0;
        int size = 10;

        Map<String, String[]> params = request.getParameterMap();

        if (params.containsKey("recordID"))
            recordId = params.get("recordID")[0];
        if (params.containsKey("checksum"))
            checksum = params.get("checksum")[0];

        if (params.containsKey("page")) {
            try {
                page = Integer.parseInt(params.get("page")[0]);
            } catch (NumberFormatException ignored) {
            }
        }

        if (params.containsKey("size")) {
            try {
                size = Integer.parseInt(params.get("size")[0]);
            } catch (NumberFormatException ignored) {
            }
        }

        if (recordId == null || recordId.isEmpty()) {
            return createMessageResponse(response, "missingParamRecordID", "You must specify a recordID.", "FAILED",
                    HttpStatus.BAD_REQUEST);
        }

        if (!validateChecksum("getRecordingTextTracks", checksum, request.getQueryString())) {
            return createMessageResponse(response, "checksumError", "You did not pass the checksum security check",
                    "FAILED", HttpStatus.BAD_REQUEST);
        }

        List<Track> tracks = recordingService.getTracks(recordId);

        if (tracks == null) {
            return createMessageResponse(response, "noRecordings", "No recording found for " + recordId, "FAILED",
                    HttpStatus.NOT_FOUND);
        } else if (tracks.size() == 0) {
            return createMessageResponse(response, "noCaptionsFound", "No captions found for " + recordId, "FAILED",
                    HttpStatus.NOT_FOUND);
        } else {
            TrackContent content = new TrackContent();
            List<TrackModel> trackDtos = new ArrayList<>();
            for (Track track : tracks)
                trackDtos.add(TrackModel.toModel(track));

            Pageable pageable = PageRequest.of(page, size);
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), trackDtos.size());
            Page<TrackModel> trackPage = new PageImpl<>(trackDtos.subList(start, end), pageable, trackDtos.size());

            content.setTracks(trackPage);
            response.setContent(content);
            response.setReturnCode("SUCCESS");
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
    }

    @Override
    public ResponseEntity<Response> putRecordingTextTrack(@RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        ResponseV1 response = new ResponseV1();

        String recordId = null;
        String kind = null;
        String lang = null;
        String label = null;
        String checksum = null;

        Map<String, String[]> params = request.getParameterMap();

        if (params.containsKey("recordID"))
            recordId = params.get("recordID")[0];
        if (params.containsKey("kind"))
            kind = params.get("kind")[0];
        if (params.containsKey("lang"))
            lang = params.get("lang")[0];
        if (params.containsKey("label"))
            label = params.get("label")[0];
        if (params.containsKey("checksum"))
            checksum = params.get("checksum")[0];

        if (!validateChecksum("putRecordingTextTrack", checksum, request.getQueryString())) {
            return createMessageResponse(response, "checksumError", "You did not pass the checksum security check",
                    "FAILED", HttpStatus.BAD_REQUEST);
        }

        if (recordId == null || recordId.isEmpty()) {
            return createMessageResponse(response, "paramError", "Missing param recordID.", "FAILED",
                    HttpStatus.BAD_REQUEST);
        }

        if (kind == null || kind.isEmpty()) {
            return createMessageResponse(response, "paramError", "Missing param kind.", "FAILED",
                    HttpStatus.BAD_REQUEST);
        }

        if (!kind.equals("subtitles") && !kind.equals("captions")) {
            return createMessageResponse(response, "invalidKind",
                    "Invalid kind parameter, expected='subtitles|captions' actual=" + kind, "FAILED",
                    HttpStatus.BAD_REQUEST);
        }

        if (lang == null || lang.isEmpty()) {
            return createMessageResponse(response, "paramError", "Missing param lang.", "FAILED",
                    HttpStatus.BAD_REQUEST);
        }

        Locale locale;
        try {
            locale = LocaleUtils.toLocale(lang);
        } catch (IllegalArgumentException e) {
            return createMessageResponse(response, "invalidLang", "Malformed lang param, received=" + lang, "FAILED",
                    HttpStatus.BAD_REQUEST);
        }

        String captionsLang = locale.toLanguageTag();
        if (label == null || label.isEmpty())
            label = locale.getDisplayLanguage();

        if (!file.isEmpty()) {
            boolean result = recordingService.putTrack(file, recordId, kind, captionsLang, label);
            if (result) {
                MessageContent content = new MessageContent();
                content.setMessageKey("upload_text_track_success");
                content.setMessage("Text track uploaded successfully");
                content.setRecordId(recordId);
                response.setContent(content);
                response.setReturnCode("SUCCESS");
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                MessageContent content = new MessageContent();
                content.setMessageKey("upload_text_track_failed");
                content.setMessage("Text track upload failed.");
                content.setRecordId(recordId);
                response.setContent(content);
                response.setReturnCode("SUCCESS");
                return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else {
            return createMessageResponse(response, "empty_uploaded_text_track", "Empty uploaded text track.", "FAILED",
                    HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public String getMeetingSummary(HttpServletRequest request) {
        ResponseV1 response = new ResponseV1();

        String recordId = null;
        String checksum = null;

        Map<String, String[]> params = request.getParameterMap();

        if (params.containsKey("recordID"))
            recordId = params.get("recordID")[0];
        if (params.containsKey("checksum"))
            checksum = params.get("checksum")[0];

        if (!validateChecksum("getRecordingEvents", checksum, request.getQueryString())) {
            return xmlService.constructGenericResponse(new String[] { "returnCode", "messageKey", "message" },
                    new String[] { "FAILED", "checksumError", "You did not pass the checksum security check" });
        }

        if (recordId == null || recordId.isEmpty()) {
            return xmlService.constructGenericResponse(new String[] { "returnCode", "messageKey", "message" },
                    new String[] { "FAILED", "missingParamRecordID", "You must provide a recordID" });
        }

        Events events = recordingService.getEvents(recordId);

        if (events == null) {
            return xmlService.constructGenericResponse(new String[] { "returnCode", "messageKey", "message" },
                    new String[] { "FAILED", "notFound", "We could not find any events for " + recordId });
        }

        String eventsXml = xmlService.eventsToXml(events);
        return xmlService.constructResponseFromXml(eventsXml);
    }

    private boolean validateChecksum(String apiCall, String checksum, String queryString) {
        if (checksum == null || checksum.equals(""))
            return false;

        if (queryString == null)
            queryString = "";
        else {
            queryString = queryString.replace("&checksum=" + checksum, "");
            queryString = queryString.replace("checksum=" + checksum + "&", "");
            queryString = queryString.replace("checksum=" + checksum, "");
        }

        logger.info("CHECKSUM={} length={}", checksum, checksum.length());

        String data = apiCall + queryString + securitySalt;
        String cs = DigestUtils.sha1Hex(data);

        if (checksum.length() == 64) {
            cs = DigestUtils.sha256Hex(data);
            logger.info("SHA256 {}", cs);
        }
        if (!cs.equals(checksum)) {
            logger.info("query string after checksum removed: [{}]", queryString);
            logger.info("checksumError: query string checksum failed. our: [{}], client: [{}]", cs, checksum);
            return false;
        }

        return true;
    }

    private ResponseEntity<Response> createMessageResponse(ResponseV1 response, String messageKey, String message,
            String returnCode, HttpStatus status) {
        MessageContent content = new MessageContent();
        content.setMessageKey(messageKey);
        content.setMessage(message);
        response.setContent(content);
        response.setReturnCode(returnCode);
        return new ResponseEntity<>(response, status);
    }
}