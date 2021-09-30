package org.bigbluebutton.api.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.fge.jsonpatch.JsonPatch;
import com.github.fge.jsonpatch.JsonPatchException;
import com.querydsl.core.types.dsl.BooleanExpression;
import org.bigbluebutton.api.dao.RecordingPredicatesBuilder;
import org.bigbluebutton.api.dao.RecordingRepository;
import org.bigbluebutton.api.model.dto.RecordingDTO;
import org.bigbluebutton.api.model.dto.View;
import org.bigbluebutton.api.model.entity.Recording;
import org.bigbluebutton.api.model.entity.RecordingMetadata;
import org.bigbluebutton.api.model.mapper.RecordingMapper;
import org.bigbluebutton.api.service.JPAService;
import org.bigbluebutton.api.service.RecordingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class RecordingServiceImpl implements RecordingService {

    private static final Logger logger = LoggerFactory.getLogger(RecordingServiceImpl.class);

    private final RecordingRepository recordingRepository;
    private final RecordingMapper recordingMapper;
    private final JPAService jpaService;

    public RecordingServiceImpl(RecordingRepository recordingRepository, RecordingMapper recordingMapper, JPAService jpaService) {
        this.recordingRepository = recordingRepository;
        this.recordingMapper = recordingMapper;
        this.jpaService = jpaService;
    }

    @Override
    public Optional<Recording> findById(String id) {
        return recordingRepository.findById(id);
    }

    @Override
    public Optional<Recording> findByInternalMeetingId(String internalMeetingId) {
        return recordingRepository.findByInternalMeetingId(internalMeetingId);
    }

    @Override
    public Page<Recording> searchRecordings(String query, Pageable pageable) {
        logger.info("Searching recordings with query [{}]", query);

        RecordingPredicatesBuilder builder = new RecordingPredicatesBuilder();
        Pattern pattern = Pattern.compile("(\\w+?)(:|<|>)(\\S(?: *\\S+)*),");
        Matcher matcher = pattern.matcher(query + ",");

        while(matcher.find()) {
            logger.info("Matched [{} {} {}]", matcher.group(1), matcher.group(2), matcher.group(3));
            builder.with(matcher.group(1), matcher.group(2), matcher.group(3));
        }

        BooleanExpression expression = builder.build();

        if(expression == null) {
            return null;
        }

        logger.info("Querying database with expression [{}]", expression);
        try {
            Iterable<Recording> recordings = recordingRepository.findAll(expression);
            return recordingListToPage(
                    StreamSupport.stream(recordings.spliterator(), false)
                            .collect(Collectors.toList()),
                    pageable
            );
        } catch(Exception e) {
            e.printStackTrace();
            logger.error("Failed to query database");
            return null;
        }
    }

    @Override
    public Page<Recording> searchMetadata(String query, Pageable pageable) {
        logger.info("Searching recording metadata with query [{}]", query);

        Pattern pattern = Pattern.compile("(.*?)(:|<|>)(\\S(?: *\\S+)*),");
        Matcher matcher = pattern.matcher(query + ",");

        StringBuilder dbQueryString = new StringBuilder();
        dbQueryString.append("SELECT * FROM recording_metadata");
        int numMatches = 0;
        while(matcher.find()) {
            logger.info("Matched [{} {} {}]", matcher.group(1), matcher.group(2), matcher.group(3));

            numMatches++;
            if(numMatches > 1) {
                dbQueryString.append(" AND ");
            }

            String path = matcher.group(1) + "/text()";
            String value = matcher.group(3);
            String predicate = " WHERE cast(xpath('" + path + "', content) as text[]) = '{" + value +"}'";
            dbQueryString.append(predicate);
        }

        if(numMatches == 0) {
            return null;
        }

        logger.info("Querying database with expression [{}]", dbQueryString);
        List<RecordingMetadata> metadataList = jpaService.executeQuery(dbQueryString.toString(), RecordingMetadata.class);
        List<Recording> recordings = new ArrayList<>();

        if(metadataList == null) {
            return null;
        }

        for(RecordingMetadata metadata: metadataList) {
            recordings.add(metadata.getRecording());
        }

        return recordingListToPage(recordings, pageable);
    }

    @Override
    public Recording patch(Recording recording, JsonPatch patch) throws JsonPatchException, JsonProcessingException {
        RecordingDTO recordingDTO = recordingMapper.toRecordingDTO(recording);
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.disable(MapperFeature.DEFAULT_VIEW_INCLUSION);
        objectMapper.setConfig(objectMapper.getDeserializationConfig().withView(View.PatchView.class));
        JsonNode patched = patch.apply(objectMapper.convertValue(recordingDTO, JsonNode.class));
        RecordingDTO updatedRecordingDTO = objectMapper.treeToValue(patched, RecordingDTO.class);
        return recordingMapper.toRecording(updatedRecordingDTO, recording);
    }

    @Override
    public Recording save(Recording recording) {
        return recordingRepository.save(recording);
    }

    @Override
    public void delete(Recording recording) {
        recordingRepository.delete(recording);
    }

    private Page<Recording> recordingListToPage(List<Recording> recordings, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), recordings.size());

        return new PageImpl<>(recordings.subList(start, end), pageable, recordings.size());
    }
}
