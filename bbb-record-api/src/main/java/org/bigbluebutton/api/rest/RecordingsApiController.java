package org.bigbluebutton.api.rest;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.fge.jsonpatch.JsonPatch;
import com.github.fge.jsonpatch.JsonPatchException;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Schema;
import org.bigbluebutton.api.model.entity.Recording;
import org.bigbluebutton.api.model.response.Error;
import org.bigbluebutton.api.model.response.*;
import org.bigbluebutton.api.model.response.payload.RecordingPayload;
import org.bigbluebutton.api.model.response.payload.RecordingSearchPayload;
import org.bigbluebutton.api.service.RecordingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.config.EnableHypermediaSupport;
import org.springframework.hateoas.config.EnableHypermediaSupport.HypermediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.Optional;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;

@RestController
@EnableHypermediaSupport(type = HypermediaType.HAL)
public class RecordingsApiController implements RecordingsApi {

    private static final Logger log = LoggerFactory.getLogger(RecordingsApiController.class);

    private final ObjectMapper objectMapper;
    private final HttpServletRequest request;
    private final RecordingService recordingService;


    @Autowired
    public RecordingsApiController(ObjectMapper objectMapper, HttpServletRequest request, RecordingService recordingService) {
        this.objectMapper = objectMapper;
        this.request = request;
        this.recordingService = recordingService;
    }

    public ResponseEntity<ResponseEnvelope> deleteRecording(@Parameter(in = ParameterIn.PATH, description = "ID of the recording to be deleted", required=true,
            schema=@Schema()) @PathVariable("recordingId") String recordingId) {
        ResponseEnvelope response = new ResponseEnvelope();

        if(recordingId == null || recordingId.isEmpty()) {
            Errors errors = new Errors();
            errors.addError(Error.ID_NOT_PROVIDED);
            response.setErrors(errors);
            return new ResponseEntity<>(response, HttpStatus.METHOD_NOT_ALLOWED);
        }

        Optional<Recording> recording = recordingService.findById(recordingId);

        if(recording.isPresent()) {
            recordingService.delete(recording.get());
            return new ResponseEntity<>(response, HttpStatus.NO_CONTENT);
        } else {
            Errors errors = new Errors();
            errors.addError(Error.ID_NOT_FOUND);
            response.setErrors(errors);
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    public ResponseEntity<ResponseEnvelope> getRecording(@Parameter(in = ParameterIn.PATH, description = "ID of the recording to be retrieved", required=true,
            schema=@Schema()) @PathVariable("recordingId") String recordingId) {
        ResponseEnvelope response = new ResponseEnvelope();

        if(recordingId == null || recordingId.isEmpty()) {
            Errors errors = new Errors();
            errors.addError(Error.ID_NOT_PROVIDED);
            response.setErrors(errors);
            return new ResponseEntity<>(response, HttpStatus.METHOD_NOT_ALLOWED);
        }

        Optional<Recording> recording = recordingService.findById(recordingId);

        if(recording.isPresent()) {
            RecordingPayload payload = new RecordingPayload();
            Recording r = recording.get();
            addSelfLink(r);
            payload.setRecording(recording.get());
            response.setPayload(payload);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            Errors errors = new Errors();
            errors.addError(Error.ID_NOT_FOUND);
            response.setErrors(errors);
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    @Override
    public ResponseEntity<ResponseEnvelope> getRecordings(@Parameter(in = ParameterIn.QUERY, description = "Search filters for recordings",
            schema = @Schema()) @RequestParam(value = "query", required = false) String query, @Parameter(in = ParameterIn.QUERY, description = "Page number",
            schema = @Schema()) @RequestParam(value = "page", required = false) Integer page, @Parameter(in = ParameterIn.QUERY, description = "Page size",
            schema = @Schema()) @RequestParam(value = "size", required = false) Integer size) {
        ResponseEnvelope response = new ResponseEnvelope();

        if(query == null || query.isEmpty()) {
            Errors errors = new Errors();
            errors.addError(Error.QUERY_NOT_PROVIDED);
            response.setErrors(errors);
            return new ResponseEntity<>(response, HttpStatus.OK);
        }

        if(page == null) {
            page = 0;
        }

        if(size == null) {
            size = 20;
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Recording> recordings = recordingService.searchRecordings(query, pageable);

        if(recordings.toList().isEmpty()) {
            Errors errors = new Errors();
            errors.addError(Error.NO_RESULTS);
            response.setErrors(errors);
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }

        for(Recording recording: recordings.toList()) {
            addSelfLink(recording);
        }

        RecordingSearchPayload payload = new RecordingSearchPayload();
        payload.setRecordings(recordings);
        response.setPayload(payload);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    public ResponseEntity<ResponseEnvelope> updateRecording(@Parameter(in = ParameterIn.PATH, description = "ID of the recording to be updated", required=true,
            schema=@Schema()) @PathVariable("recordingId") String recordingId, @Parameter(in = ParameterIn.DEFAULT, description = "Recording object to be updated",
            required=true, schema=@Schema()) @Valid @RequestBody JsonPatch patch) {
        ResponseEnvelope response = new ResponseEnvelope();

        Optional<Recording> recording = recordingService.findById(recordingId);
        if(recording.isPresent()) {
            try {
                Recording patched = recordingService.patch(recording.get(), patch);
                Recording r = recordingService.save(patched);
                addSelfLink(r);
                RecordingPayload payload = new RecordingPayload();
                payload.setRecording(r);
                response.setPayload(payload);
                return new ResponseEntity<>(response, HttpStatus.OK);
            } catch(JsonPatchException | JsonProcessingException e) {
                Errors errors = new Errors();
                errors.addError(Error.UNKNOWN);
                response.setErrors(errors);
                return new ResponseEntity<>(response, HttpStatus.METHOD_NOT_ALLOWED);
            }
        } else {
            Errors errors = new Errors();
            errors.addError(Error.ID_NOT_FOUND);
            response.setErrors(errors);
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    private void addSelfLink(Recording recording) {
        Link selfLink = linkTo(RecordingsApiController.class).slash(recording.getId()).withSelfRel();
        recording.add(selfLink);
    }

}
