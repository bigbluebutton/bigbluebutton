package org.bigbluebutton.rest.v1;

import org.apache.commons.codec.digest.DigestUtils;
import org.bigbluebutton.dao.entity.Recording;
import org.bigbluebutton.request.MetadataParams;
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
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
public class RecordingApiControllerV1 implements RecordingApiV1 {

    private static final Logger logger = LoggerFactory.getLogger(RecordingApiControllerV1.class);

    @Value("${bbb.security.salt}")
    private String securitySalt;

    private final RecordingService recordingService;
    private final XmlService xmlService;

    @Autowired
    public RecordingApiControllerV1(@Qualifier("fileImpl") RecordingService recordingService, XmlService xmlService) {
        this.recordingService = recordingService;
        this.xmlService = xmlService;
    }

    @Override
    public String getRecordings(HttpServletRequest request) {
        List<String> meetingIds = new ArrayList<>();
        List<String> recordIds = new ArrayList<>();
        List<String> states = new ArrayList<>();
        Map<String, String> meta = new HashMap<>();
        int page = 0;
        int size = 25;
        String checksum = null;

        Map<String, String[]> params = request.getParameterMap();

        if(params.containsKey("meetingID")) meetingIds.addAll(Arrays.asList(params.get("meetingID")));
        if(params.containsKey("recordID")) recordIds.addAll(Arrays.asList(params.get("recordID")));
        if(params.containsKey("state")) states.addAll(Arrays.asList(params.get("state")));
        if(params.containsKey("checksum")) checksum = params.get("checksum")[0];

        if(params.containsKey("page")) {
            try {
                page = Integer.parseInt(params.get("page")[0]);
            } catch(NumberFormatException ignored) { }
        }

        if(params.containsKey("size")) {
            try {
                size = Integer.parseInt(params.get("size")[0]);
            } catch(NumberFormatException ignored) { }
        }

        for(Map.Entry<String, String[]> entry: params.entrySet()) {
            if (MetadataParams.isMetaValid(entry.getKey())) meta.put(entry.getKey(), entry.getValue()[0]);
        }

        meta = MetadataParams.processMetaParams(meta);

        if(!validateChecksum("getRecordings", checksum, request.getQueryString())) {
            return xmlService.constructGenericResponse(
                    new String[] { "returnCode", "messageKey","message" },
                    new String[] { "FAILED", "checksumError", "You did not pass the checksum security check" }
            );
        }

        List<Recording> recordings = recordingService.searchRecordings(meetingIds, recordIds, states, meta);

        Pageable pageable = PageRequest.of(page, size);
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), recordings.size());
        Page<Recording> recordingPage = new PageImpl<>(recordings.subList(start, end), pageable, recordings.size());

        String recordingsXml = xmlService.recordingsToXml(recordingPage.getContent());
        String response = xmlService.constructResponseFromRecordingsXml(recordingsXml);
        return xmlService.constructPaginatedResponse(recordingPage, response);
    }

    @Override
    public String publishRecordings(HttpServletRequest request) {
        List<String> recordIds = new ArrayList<>();
        boolean publish = false;
        String checksum = null;

        Map<String, String[]> params = request.getParameterMap();

        if(params.containsKey("recordID")) recordIds.addAll(Arrays.asList(params.get("recordID")));

        if(params.containsKey("publish")) {
            String p = params.get("publish")[0];
            if(p.equalsIgnoreCase("true")) publish = true;
            else if(p.equalsIgnoreCase("false")) publish = false;
            else {
                return xmlService.constructGenericResponse(
                        new String[] { "returnCode", "messageKey", "message" },
                        new String[] { "FAILED", "missingParamPublish", "You must specify a publish value true or false." }
                );
            }
        }

        if(params.containsKey("checksum")) checksum = params.get("checksum")[0];

        if(!validateChecksum("publishRecordings", checksum, request.getQueryString())) {
            return xmlService.constructGenericResponse(
                    new String[] { "returnCode", "messageKey","message" },
                    new String[] { "FAILED", "checksumError", "You did not pass the checksum security check" }
            );
        }

        List<Recording> recordings = new ArrayList<>();
        for(String id: recordIds) {
            Recording recording = recordingService.publishRecording(id, publish);
            if(recording != null) recordings.add(recording);
        }

        if(recordings.size() == 0) {
            return xmlService.constructGenericResponse(
                    new String[] { "returnCode","messageKey", "message" },
                    new String[] { "FAILED", "notFound", "We could not find any recordings" }
            );
        } else return xmlService.constructGenericResponse(
                new String[] { "returnCode", "published" },
                new String[] { "SUCCESS", String.valueOf(publish) }
        );
    }

    @Override
    public String deleteRecordings(HttpServletRequest request) {
        List<String> recordIds = new ArrayList<>();
        String checksum = null;

        Map<String, String[]> params = request.getParameterMap();

        if(params.containsKey("recordID")) recordIds.addAll(Arrays.asList(params.get("recordID")));

        if(params.containsKey("checksum")) checksum = params.get("checksum")[0];

        if(!validateChecksum("deleteRecordings", checksum, request.getQueryString())) {
            return xmlService.constructGenericResponse(
                    new String[] { "returnCode", "messageKey","message" },
                    new String[] { "FAILED", "checksumError", "You did not pass the checksum security check" }
            );
        }

        List<Boolean> deletions = new ArrayList<>();
        for(String id: recordIds) {
            boolean wasDeleted = recordingService.deleteRecording(id);
            if(wasDeleted) deletions.add(true);
        }

        if(deletions.size() == 0) {
            return xmlService.constructGenericResponse(
                    new String[] { "returnCode","messageKey", "message" },
                    new String[] { "FAILED", "notFound", "We could not find any recordings" }
            );
        } else {
            return xmlService.constructGenericResponse(
                    new String[] { "returnCode","deleted" },
                    new String[] { "SUCCESS", "true" }
            );
        }
    }

    @Override
    public String updateRecordings(HttpServletRequest request) {
        List<String> recordIds = new ArrayList<>();
        Map<String, String> meta = new HashMap<>();
        String checksum = null;

        Map<String, String[]> params = request.getParameterMap();

        if(params.containsKey("recordID")) recordIds.addAll(Arrays.asList(params.get("recordID")));
        if(params.containsKey("checksum")) checksum = params.get("checksum")[0];

        for(Map.Entry<String, String[]> entry: params.entrySet()) {
            if (MetadataParams.isMetaValid(entry.getKey())) meta.put(entry.getKey(), entry.getValue()[0]);
        }

        meta = MetadataParams.processMetaParams(meta);

        if(!validateChecksum("updateRecordings", checksum, request.getQueryString())) {
            return xmlService.constructGenericResponse(
                    new String[] { "returnCode", "messageKey","message" },
                    new String[] { "FAILED", "checksumError", "You did not pass the checksum security check" }
            );
        }

        List<Recording> recordings = new ArrayList<>();
        for(String id: recordIds) {
            Recording recording = recordingService.updateRecording(id, meta);
            if(recording != null) recordings.add(recording);
        }

        if(recordings.size() == 0) {
            return xmlService.constructGenericResponse(
                    new String[] { "returnCode","messageKey", "message" },
                    new String[] { "FAILED", "notFound", "We could not find any recordings" }
            );
        } else return xmlService.constructGenericResponse(
                new String[] { "returnCode", "updated" },
                new String[] { "SUCCESS", "true" }
        );
    }

    private boolean validateChecksum(String apiCall, String checksum, String queryString) {
        if(checksum == null || checksum.equals("")) return false;

        if(queryString == null) queryString = "";
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
}