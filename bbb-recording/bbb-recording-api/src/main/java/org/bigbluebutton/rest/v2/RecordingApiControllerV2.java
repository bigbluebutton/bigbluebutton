package org.bigbluebutton.rest.v2;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import org.bigbluebutton.dao.entity.Recording;
import org.bigbluebutton.dao.entity.Track;
import org.bigbluebutton.request.AddTextTrackBody;
import org.bigbluebutton.request.MetadataParams;
import org.bigbluebutton.response.Response;
import org.bigbluebutton.response.ResponseEnvelope;
import org.bigbluebutton.response.error.Error;
import org.bigbluebutton.response.error.Errors;
import org.bigbluebutton.response.model.RecordingModel;
import org.bigbluebutton.response.model.TrackModel;
import org.bigbluebutton.response.model.assembler.RecordingModelAssembler;
import org.bigbluebutton.response.model.assembler.TrackModelAssembler;
import org.bigbluebutton.response.payload.RecordingPayload;
import org.bigbluebutton.response.payload.RecordingsPayload;
import org.bigbluebutton.response.payload.TracksPayload;
import org.bigbluebutton.service.RecordingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.PagedModel;
import org.springframework.hateoas.config.EnableHypermediaSupport;
import org.springframework.hateoas.config.EnableHypermediaSupport.HypermediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/v2/recordings")
@EnableHypermediaSupport(type = HypermediaType.HAL)
public class RecordingApiControllerV2 implements RecordingApiV2 {

    private static final Logger logger = LoggerFactory.getLogger(RecordingApiControllerV2.class);

    private RecordingService recordingService;
    private RecordingModelAssembler recordingModelAssembler;
    private TrackModelAssembler trackModelAssembler;
    private PagedResourcesAssembler<Recording> recordingPagedResourcesAssembler;
    private PagedResourcesAssembler<Track> trackPagedResourcesAssembler;

    @Autowired
    public RecordingApiControllerV2(
            @Qualifier("dbImpl") RecordingService recordingService,
            RecordingModelAssembler recordingModelAssembler,
            TrackModelAssembler trackModelAssembler,
            PagedResourcesAssembler<Recording> recordingPagedResourcesAssembler,
            PagedResourcesAssembler<Track> trackPagedResourcesAssembler
    ) {
        this.recordingService = recordingService;
        this.recordingModelAssembler = recordingModelAssembler;
        this.trackModelAssembler = trackModelAssembler;
        this.recordingPagedResourcesAssembler = recordingPagedResourcesAssembler;
        this.trackPagedResourcesAssembler = trackPagedResourcesAssembler;
    }

    @Override
    public ResponseEntity<Response> getRecordings(@RequestParam MultiValueMap<String, String> params) {
        logger.info("Params {}", params);

        ResponseEnvelope response = new ResponseEnvelope();

        List<String> meetingIds = new ArrayList<>();
        List<String> recordIds = new ArrayList<>();
        List<String> states = new ArrayList<>();
        Map<String, String> meta = new HashMap<>();
        int page = 0;
        int size = 10;

        if (params.containsKey("meetingID"))
            meetingIds.addAll(params.get("meetingID"));
        if (params.containsKey("recordID"))
            recordIds.addAll(params.get("recordID"));
        if (params.containsKey("state"))
            states.addAll(params.get("state"));

        if (params.containsKey("page")) {
            try {
                page = Integer.parseInt(Objects.requireNonNull(params.getFirst("page")));
            } catch (NumberFormatException ignored) {
            }
        }

        if (params.containsKey("size")) {
            try {
                size = Integer.parseInt(Objects.requireNonNull(params.getFirst("size")));
            } catch (NumberFormatException ignored) {
            }
        }

        for (Map.Entry<String, List<String>> entry : params.entrySet()) {
            if (MetadataParams.isMetaValid(entry.getKey()))
                meta.put(entry.getKey(), entry.getValue().get(0));
        }

        meta = MetadataParams.processMetaParams(meta);

        List<Recording> recordings = recordingService.searchRecordings(meetingIds, recordIds, states, meta);

        if (recordings == null || recordings.isEmpty()) {
            Errors errors = new Errors();
            errors.addError(Error.NO_RESULTS);
            response.setErrors(errors);
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }

        logger.info("{} recordings found", recordings.size());

        Pageable pageable = PageRequest.of(page, size);
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), recordings.size());
        Page<Recording> recordingPage = new PageImpl<>(recordings.subList(start, end), pageable,
                recordings.size());

        RecordingsPayload payload = new RecordingsPayload();
        PagedModel<RecordingModel> pagedModel = recordingPagedResourcesAssembler.toModel(recordingPage, recordingModelAssembler);
        payload.setRecordings(pagedModel);
        response.setPayload(payload);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Response> getRecording(
            @Parameter(in = ParameterIn.PATH, description = "ID of the recording", required = true) @PathVariable("recordID") String recordID
    ) {
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
            @Parameter(in = ParameterIn.DEFAULT, description = "Metadata params to update", required = true) @RequestBody MetadataParams meta
    ) {
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
            @Parameter(in = ParameterIn.PATH, description = "ID of the recording", required = true) @PathVariable("recordID") String recordID
    ) {
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
            @Parameter(in = ParameterIn.QUERY, description = "Should the recording be published", required = true) @RequestParam("publish") Boolean publish
    ) {
        ResponseEnvelope response = new ResponseEnvelope();

        ResponseEntity<Response> r = checkForId(response, recordID);
        if (r != null)
            return r;

        Recording recording = recordingService.publishRecording(recordID, publish);
        return createRecordingResponse(response, recording);
    }

    @Override
    public ResponseEntity<Response> getRecordingTextTracks(
            @Parameter(in = ParameterIn.PATH, description = "ID of the recording", required = true) @PathVariable("recordID") String recordID,
            @Parameter(in = ParameterIn.QUERY, description = "Page number") @RequestParam("page") String page,
            @Parameter(in = ParameterIn.QUERY, description = "Number of tracks per page") @RequestParam("size") String size
    ) {
        ResponseEnvelope response = new ResponseEnvelope();

        ResponseEntity<Response> r = checkForId(response, recordID);
        if (r != null)
            return r;

        List<Track> tracks = recordingService.getTracks(recordID);

        if(tracks == null || tracks.isEmpty()) {
            Errors errors = new Errors();
            errors.addError(Error.NO_RESULTS);
            response.setErrors(errors);
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } else {
            int p = 0;
            int s = 10;

            try {
                p = Integer.parseInt(Objects.requireNonNull(page));
                s = Integer.parseInt(Objects.requireNonNull(size));
            } catch (NumberFormatException ignored) {
            }

            Pageable pageable = PageRequest.of(p, s);
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), tracks.size());
            Page<Track> trackPage = new PageImpl<>(tracks.subList(start, end), pageable,
                    tracks.size());

            TracksPayload payload = new TracksPayload();
            PagedModel<TrackModel> pagedModel = trackPagedResourcesAssembler.toModel(trackPage, trackModelAssembler);
            payload.setTracks(pagedModel);
            response.setPayload(payload);

            return new ResponseEntity<>(response, HttpStatus.OK);
        }
    }

    @Override
    public ResponseEntity<Response> addRecordingTextTrack(String recordID, AddTextTrackBody body) {
        return null;
    }

    @Override
    public ResponseEntity<Response> getMeetingSummary(String recordID) {
        return null;
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
            RecordingModel recordingModel = RecordingModel.toModel(recording);
            RecordingPayload payload = new RecordingPayload();
            payload.setRecordingDto(recordingModel);
            response.setPayload(payload);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            Errors errors = new Errors();
            errors.addError(Error.ID_NOT_FOUND);
            response.setErrors(errors);
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }
}
