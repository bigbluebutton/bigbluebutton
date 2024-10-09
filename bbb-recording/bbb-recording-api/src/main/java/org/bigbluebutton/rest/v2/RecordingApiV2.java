package org.bigbluebutton.rest.v2;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import org.bigbluebutton.request.TextTrackInfo;
import org.bigbluebutton.request.MetadataParams;
import org.bigbluebutton.response.Response;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;

public interface RecordingApiV2 {

    @RequestMapping(value = "", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    ResponseEntity<Response> getRecordings(@RequestParam MultiValueMap<String, String> params);

    @RequestMapping(value = "/{recordID}", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    ResponseEntity<Response> getRecording(
            @Parameter(in = ParameterIn.PATH, description = "ID of the recording", required = true) @PathVariable("recordID") String recordID);

    @RequestMapping(value = "/{recordID}", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.POST)
    ResponseEntity<Response> updateRecording(
            @Parameter(in = ParameterIn.PATH, description = "ID of the recording", required = true) @PathVariable("recordID") String recordID,
            @Parameter(in = ParameterIn.DEFAULT, description = "Metadata params to update", required = true) @RequestBody MetadataParams meta);

    @RequestMapping(value = "/{recordID}", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.DELETE)
    ResponseEntity<Response> deleteRecording(
            @Parameter(in = ParameterIn.PATH, description = "ID of the recording", required = true) @PathVariable("recordID") String recordID);

    @RequestMapping(value = "/{recordID}", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.PUT)
    ResponseEntity<Response> publishRecording(
            @Parameter(in = ParameterIn.PATH, description = "ID of the recording", required = true) @PathVariable("recordID") String recordID,
            @Parameter(in = ParameterIn.QUERY, description = "Should the recording be published", required = true) @RequestParam("publish") Boolean publish);

    @RequestMapping(value = "/{recordID}/tracks", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    ResponseEntity<Response> getRecordingTextTracks(
            @Parameter(in = ParameterIn.PATH, description = "ID of the recording", required = true) @PathVariable("recordID") String recordID,
            @Parameter(in = ParameterIn.QUERY, description = "Page number") @RequestParam("page") String page,
            @Parameter(in = ParameterIn.QUERY, description = "Number of tracks per page") @RequestParam("size") String size);

    @RequestMapping(value = "/{recordID}/tracks", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.POST)
    ResponseEntity<Response> addRecordingTextTrack(
            @Parameter(in = ParameterIn.PATH, description = "ID of the recording", required = true) @PathVariable("recordID") String recordID,
            @RequestPart(value = "info") @Valid TextTrackInfo info, @RequestPart(value = "file") MultipartFile file);

    @RequestMapping(value = "/{recordID}/events", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    ResponseEntity<Response> getMeetingSummary(
            @Parameter(in = ParameterIn.PATH, description = "ID of the recording", required = true) @PathVariable("recordID") String recordID,
            @RequestHeader(value = "accept", required = false) String accept);
}
