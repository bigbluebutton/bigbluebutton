package org.bigbluebutton.rest.v2;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import org.bigbluebutton.dao.entity.Recording;
import org.bigbluebutton.request.MetadataParams;
import org.bigbluebutton.response.Response;
import org.bigbluebutton.response.ResponseEnvelope;
import org.bigbluebutton.response.dto.RecordingDto;
import org.bigbluebutton.response.error.Error;
import org.bigbluebutton.response.error.Errors;
import org.bigbluebutton.response.payload.RecordingPayload;
import org.bigbluebutton.service.RecordingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.config.EnableHypermediaSupport;
import org.springframework.hateoas.config.EnableHypermediaSupport.HypermediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;

@RestController
@EnableHypermediaSupport(type = HypermediaType.HAL)
public class RecordingApiControllerV2 implements RecordingApiV2 {

    private static final Logger logger = LoggerFactory.getLogger(RecordingApiControllerV2.class);

    private RecordingService recordingService;

    @Autowired
    public RecordingApiControllerV2(@Qualifier("dbImpl") RecordingService recordingService) {
        this.recordingService = recordingService;
    }

    @Override
    public ResponseEntity<Response> getRecordings(@RequestParam MultiValueMap<String, String> params) {
        logger.info("Params {}", params);
        return null;
    }

    @Override
    public ResponseEntity<Response> getRecording(
            @Parameter(in = ParameterIn.PATH, description = "ID of the recording", required = true) @PathVariable("recordID") String recordID) {
        ResponseEnvelope response = new ResponseEnvelope();

        ResponseEntity<Response> r = checkForId(response, recordID);
        if (r != null)
            return r;

        Recording recording = recordingService.findRecording(recordID);
        return createRecordingResponse(response, recording);
    }

    @Override
    public ResponseEntity<Response> updateRecording(
            @Parameter(in = ParameterIn.PATH, description = "ID of the recording", required = true) @PathVariable("recordID") String recordID,
            @Parameter(in = ParameterIn.DEFAULT, description = "Metadata params to update", required = true) @RequestBody MetadataParams meta) {
        ResponseEnvelope response = new ResponseEnvelope();

        ResponseEntity<Response> r = checkForId(response, recordID);
        if (r != null)
            return r;

        if (meta.getMeta() == null || meta.getMeta().size() == 0) {
            Errors errors = new Errors();
            errors.addError(Error.METADATA_NOT_PROVIDED);
            response.setErrors(errors);
            return new ResponseEntity<>(response, HttpStatus.METHOD_NOT_ALLOWED);
        }

        Recording recording = recordingService.updateRecording(recordID, meta.getMeta());
        return createRecordingResponse(response, recording);
    }

    @Override
    public ResponseEntity<Response> deleteRecording(
            @Parameter(in = ParameterIn.PATH, description = "ID of the recording", required = true) @PathVariable("recordID") String recordID) {
        ResponseEnvelope response = new ResponseEnvelope();

        ResponseEntity<Response> r = checkForId(response, recordID);
        if (r != null)
            return r;

        boolean result = recordingService.deleteRecording(recordID);

        if (result)
            return new ResponseEntity<>(response, HttpStatus.OK);
        else {
            Errors errors = new Errors();
            errors.addError(Error.ID_NOT_FOUND);
            response.setErrors(errors);
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    @Override
    public ResponseEntity<Response> publishRecording(
            @Parameter(in = ParameterIn.PATH, description = "ID of the recording", required = true) @PathVariable("recordID") String recordID,
            @Parameter(in = ParameterIn.QUERY, description = "Should the recording be published", required = true) @RequestParam("publish") Boolean publish) {
        ResponseEnvelope response = new ResponseEnvelope();

        ResponseEntity<Response> r = checkForId(response, recordID);
        if (r != null)
            return r;

        Recording recording = recordingService.publishRecording(recordID, publish);
        return createRecordingResponse(response, recording);
    }

    private ResponseEntity<Response> checkForId(ResponseEnvelope response, String recordID) {
        if (recordID == null || recordID.isEmpty()) {
            Errors errors = new Errors();
            errors.addError(Error.ID_NOT_PROVIDED);
            response.setErrors(errors);
            return new ResponseEntity<>(response, HttpStatus.METHOD_NOT_ALLOWED);
        }

        return null;
    }

    private ResponseEntity<Response> createRecordingResponse(ResponseEnvelope response, Recording recording) {
        if (recording != null) {
            RecordingDto recordingDto = RecordingDto.recordingToDto(recording);
            addSelfLink(recordingDto);
            RecordingPayload payload = new RecordingPayload();
            payload.setRecordingDto(recordingDto);
            response.setPayload(payload);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            Errors errors = new Errors();
            errors.addError(Error.ID_NOT_FOUND);
            response.setErrors(errors);
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    private void addSelfLink(RecordingDto recording) {
        Link selfLink = linkTo(RecordingApiControllerV2.class).slash(recording.getRecordId()).withSelfRel();
        recording.add(selfLink);
    }
}
