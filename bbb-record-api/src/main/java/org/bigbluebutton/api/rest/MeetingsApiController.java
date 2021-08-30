package org.bigbluebutton.api.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Schema;
import org.bigbluebutton.api.model.request.Join;
import org.bigbluebutton.api.model.request.MeetingRequest;
import org.bigbluebutton.api.model.request.MeetingSearchBody;
import org.bigbluebutton.api.model.response.InlineResponse200;
import org.bigbluebutton.api.model.response.InlineResponse201;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.io.IOException;

@RestController
public class MeetingsApiController implements MeetingsApi {

    private static final Logger log = LoggerFactory.getLogger(MeetingsApiController.class);

    private final ObjectMapper objectMapper;

    private final HttpServletRequest request;

    @Autowired
    public MeetingsApiController(ObjectMapper objectMapper, HttpServletRequest request) {
        this.objectMapper = objectMapper;
        this.request = request;
    }

    public ResponseEntity<InlineResponse201> createMeeting(@Parameter(in = ParameterIn.DEFAULT, description = "Meeting object to be created", required=true,
            schema=@Schema()) @Valid @RequestBody MeetingRequest body) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<InlineResponse201>(objectMapper.readValue("{\n  \"payload\" : {\n    \"links\" : [ {\n      \"rel\" : \"rel\",\n      \"href\" : \"href\"\n    }, {\n      \"rel\" : \"rel\",\n      \"href\" : \"href\"\n    } ]\n  },\n  \"errors\" : { }\n}", InlineResponse201.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<InlineResponse201>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<InlineResponse201>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<Void> endMeeting(@Parameter(in = ParameterIn.PATH, description = "ID of the meeting to be ended", required=true,
            schema=@Schema()) @PathVariable("meetingId") String meetingId,@Parameter(in = ParameterIn.HEADER, description = "" , required=true,
            schema=@Schema()) @RequestHeader(value="X-Meeting-PW", required=true) String xMeetingPW) {
        String accept = request.getHeader("Accept");
        return new ResponseEntity<Void>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<InlineResponse200> findMeetingById(@Parameter(in = ParameterIn.PATH, description = "ID of the meeting to retrieve", required=true,
            schema=@Schema()) @PathVariable("meetingId") String meetingId) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<InlineResponse200>(objectMapper.readValue("{\n  \"payload\" : {\n    \"links\" : [ {\n      \"rel\" : \"rel\",\n      \"href\" : \"href\"\n    }, {\n      \"rel\" : \"rel\",\n      \"href\" : \"href\"\n    } ],\n    \"meeting\" : {\n      \"moderatorPW\" : \"moderatorPW\",\n      \"messageKey\" : \"messageKey\",\n      \"meetingID\" : \"meetingID\",\n      \"dialNumber\" : \"dialNumber\",\n      \"message\" : \"message\",\n      \"voiceBridge\" : 6,\n      \"duration\" : 1,\n      \"hasBeenForciblyEnded\" : true,\n      \"createTime\" : 0,\n      \"hasUserJoined\" : true,\n      \"attendeePW\" : \"attendeePW\",\n      \"parentMeetingID\" : \"parentMeetingID\",\n      \"internalMeetingID\" : \"internalMeetingID\",\n      \"createDate\" : \"createDate\"\n    }\n  },\n  \"errors\" : { }\n}", InlineResponse200.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<InlineResponse200>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<InlineResponse200>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<InlineResponse201> getMeetings(@Parameter(in = ParameterIn.DEFAULT, description = "Search filters for meetings",
            schema=@Schema()) @Valid @RequestBody MeetingSearchBody body) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<InlineResponse201>(objectMapper.readValue("{\n  \"payload\" : {\n    \"links\" : [ {\n      \"rel\" : \"rel\",\n      \"href\" : \"href\"\n    }, {\n      \"rel\" : \"rel\",\n      \"href\" : \"href\"\n    } ]\n  },\n  \"errors\" : { }\n}", InlineResponse201.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<InlineResponse201>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<InlineResponse201>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<InlineResponse201> joinMeeting(@Parameter(in = ParameterIn.PATH, description = "The ID of the meeting the user wishes to join",
            required=true, schema=@Schema()) @PathVariable("meetingId") String meetingId,@Parameter(in = ParameterIn.DEFAULT, description = "", required=true,
            schema=@Schema()) @Valid @RequestBody Join body) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<InlineResponse201>(objectMapper.readValue("{\n  \"payload\" : {\n    \"links\" : [ {\n      \"rel\" : \"rel\",\n      \"href\" : \"href\"\n    }, {\n      \"rel\" : \"rel\",\n      \"href\" : \"href\"\n    } ]\n  },\n  \"errors\" : { }\n}", InlineResponse201.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<InlineResponse201>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<InlineResponse201>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<InlineResponse201> meetingRecording(@Parameter(in = ParameterIn.PATH, description = "The ID of the meeting the user wishes to join",
            required=true, schema=@Schema()) @PathVariable("meetingId") String meetingId) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<InlineResponse201>(objectMapper.readValue("{\n  \"payload\" : {\n    \"links\" : [ {\n      \"rel\" : \"rel\",\n      \"href\" : \"href\"\n    }, {\n      \"rel\" : \"rel\",\n      \"href\" : \"href\"\n    } ]\n  },\n  \"errors\" : { }\n}", InlineResponse201.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<InlineResponse201>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<InlineResponse201>(HttpStatus.NOT_IMPLEMENTED);
    }

    public ResponseEntity<InlineResponse201> updateMeeting(@Parameter(in = ParameterIn.PATH, description = "ID of the meeting to be updated", required=true,
            schema=@Schema()) @PathVariable("meetingId") String meetingId,@Parameter(in = ParameterIn.DEFAULT, description = "Meeting object to be updated",
            required=true, schema=@Schema()) @Valid @RequestBody MeetingRequest body) {
        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("application/json")) {
            try {
                return new ResponseEntity<InlineResponse201>(objectMapper.readValue("{\n  \"payload\" : {\n    \"links\" : [ {\n      \"rel\" : \"rel\",\n      \"href\" : \"href\"\n    }, {\n      \"rel\" : \"rel\",\n      \"href\" : \"href\"\n    } ]\n  },\n  \"errors\" : { }\n}", InlineResponse201.class), HttpStatus.NOT_IMPLEMENTED);
            } catch (IOException e) {
                log.error("Couldn't serialize response for content type application/json", e);
                return new ResponseEntity<InlineResponse201>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<InlineResponse201>(HttpStatus.NOT_IMPLEMENTED);
    }

}
