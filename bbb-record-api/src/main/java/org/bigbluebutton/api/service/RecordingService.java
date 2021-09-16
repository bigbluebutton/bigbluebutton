package org.bigbluebutton.api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.github.fge.jsonpatch.JsonPatch;
import com.github.fge.jsonpatch.JsonPatchException;
import org.bigbluebutton.api.model.entity.Recording;
import org.bigbluebutton.api.model.request.RecordingSearchBody;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface RecordingService {

    Recording save(Recording recording);
    Optional<Recording> findById(String id);
    Optional<Recording> findByInternalMeetingId(String internalMeetingId);
    Page<Recording> searchRecordings(RecordingSearchBody body, Pageable pageable);
    Page<Recording> searchRecordings(String query, Pageable pageable);
    Page<Recording> searchMetadata(String query, Pageable pageable);
    Recording patch(Recording recording, JsonPatch patch) throws JsonPatchException, JsonProcessingException;
    void delete(Recording recording);
}
