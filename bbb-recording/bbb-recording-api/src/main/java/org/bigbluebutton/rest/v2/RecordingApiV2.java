package org.bigbluebutton.rest.v2;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import org.bigbluebutton.request.MetadataParams;
import org.bigbluebutton.response.Response;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;

public interface RecordingApiV2 {

    @RequestMapping(value = "/v2/recordings", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    ResponseEntity<Response> getRecordings(@RequestParam MultiValueMap<String, String> params);

    @RequestMapping(value = "/v2/recordings/{recordID}", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.GET)
    ResponseEntity<Response> getRecording(
            @Parameter(in = ParameterIn.PATH, description = "ID of the recording", required = true) @PathVariable("recordID") String recordID
    );

    @RequestMapping(value = "/v2/recordings/{recordID}", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.POST)
    ResponseEntity<Response> updateRecording(
            @Parameter(in = ParameterIn.PATH, description = "ID of the recording", required = true) @PathVariable("recordID") String recordID,
            @Parameter(in = ParameterIn.DEFAULT, description = "Metadata params to update", required = true) @RequestBody MetadataParams meta
    );

    @RequestMapping(value = "/v2/recordings/{recordID}", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.DELETE)
    ResponseEntity<Response> deleteRecording(
            @Parameter(in = ParameterIn.PATH, description = "ID of the recording", required = true) @PathVariable("recordID") String recordID
    );

    @RequestMapping(value = "/v2/recordings/{recordID}", produces = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_XML_VALUE }, method = RequestMethod.PUT)
    ResponseEntity<Response> publishRecording(
            @Parameter(in = ParameterIn.PATH, description = "ID of the recording", required = true) @PathVariable("recordID") String recordID,
            @Parameter(in = ParameterIn.QUERY, description = "Should the recording be published", required = true) @RequestParam("publish") Boolean publish
    );
}
