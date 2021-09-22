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
import org.bigbluebutton.api.model.request.NumericQuery;
import org.bigbluebutton.api.model.request.RecordingSearchBody;
import org.bigbluebutton.api.model.request.RecordingSearchFilters;
import org.bigbluebutton.api.service.JPAService;
import org.bigbluebutton.api.service.RecordingService;
import org.bigbluebutton.api.util.DataStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class RecordingServiceImpl implements RecordingService {

    private static final Logger logger = LoggerFactory.getLogger(RecordingServiceImpl.class);

    private RecordingRepository recordingRepository;
    private RecordingMapper recordingMapper;
    private JPAService jpaService;
    List<Recording> recordings;
    List<Recording> temp;

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

    @Override
    public Page<Recording> searchRecordings(RecordingSearchBody body, Pageable pageable) {
        recordings = new ArrayList<>();

        if(body != null) {

            RecordingSearchFilters filters = body.getFilters();

            List<String> recordingIds = filters.getRecordingIds();
            searchRecordingIds(recordingIds);

            List<String> internalMeetingIds = filters.getInternalMeetingIds();
            searchInternalMeetingIds(internalMeetingIds);

            List<String> meetingIds = filters.getMeetingIds();
            searchMeetingIds(meetingIds);

            List<String> names = filters.getNames();
            searchNames(names);

            Boolean isBreakout = filters.getIsBreakout();
            searchIsBreakout(isBreakout);

            Boolean published = filters.getPublished();
            searchPublished(published);

            String state = filters.getState();
            searchState(state);

            NumericQuery startTime = filters.getStartTime();
            searchStartTime(startTime);

            NumericQuery endTime = filters.getEndTime();
            searchEndTime(endTime);

            NumericQuery participants = filters.getParticipants();
            searchParticipants(participants);

            NumericQuery rawSize = filters.getRawSize();
            searchRawSize(rawSize);

            NumericQuery size = filters.getSize();
            searchSize(size);
        }

        return recordingListToPage(recordings, pageable);
    }

    private void searchRecordingIds(List<String> recordIds) {
        temp = new ArrayList<>();

        if(recordIds != null) {
            if(!recordIds.isEmpty()) {
                for(String recordingId: recordIds) {
                    Optional<Recording> recording = recordingRepository.findById(recordingId);
                    if(recording.isPresent()) {
                        temp.add(recording.get());
                    }
                }

                recordings = intersection(recordings, temp);
            }
        }
    }

    private void searchInternalMeetingIds(List<String> internalMeetingIds) {
        temp = new ArrayList<>();

        if(internalMeetingIds != null) {
            if(!internalMeetingIds.isEmpty()) {
                for(String internalMeetingId: internalMeetingIds) {
                    Optional<Recording> recording = recordingRepository.findByInternalMeetingId(internalMeetingId);
                    if(recording.isPresent()) {
                        temp.add(recording.get());
                    }
                }

                recordings = intersection(recordings, temp);
            }
        }
    }

    private void searchMeetingIds(List<String> meetingIds) {
        temp = new ArrayList<>();

        if(meetingIds != null) {
            if(!meetingIds.isEmpty()) {
                for(String meetingId: meetingIds) {
                    List<Recording> result = recordingRepository.findByMeetingId(meetingId);
                    temp.addAll(result);
                }

                recordings = intersection(recordings, temp);
            }
        }
    }

    private void searchNames(List<String> names) {
        temp = new ArrayList<>();

        if(names != null) {
            if(!names.isEmpty()) {
                for(String name: names) {
                    List<Recording> result = recordingRepository.findByName(name);
                    temp.addAll(result);
                }

                recordings = intersection(recordings, temp);
            }
        }
    }

    private void searchIsBreakout(Boolean isBreakout) {
        temp = new ArrayList<>();

        if(isBreakout != null) {
            List<Recording> result;

            if(isBreakout) {
                result = recordingRepository.findByIsBreakoutTrue();
            } else {
                result = recordingRepository.findByIsBreakoutFalse();
            }

            temp.addAll(result);
            recordings = intersection(recordings, temp);
        }
    }

    private void searchPublished(Boolean published) {
        temp = new ArrayList<>();

        if(published != null) {
            List<Recording> result;

            if(published) {
                result = recordingRepository.findByPublishedTrue();
            } else {
                result = recordingRepository.findByIsBreakoutFalse();
            }

            temp.addAll(result);
            recordings = intersection(recordings, temp);
        }
    }

    private void searchState(String state) {
        temp = new ArrayList<>();

        if(state != null) {
            List<Recording> result = recordingRepository.findByState(state);
            temp.addAll(result);
            recordings = intersection(recordings, temp);
        }
    }

    private void searchStartTime(NumericQuery startTime) {
        temp = new ArrayList<>();

        if(startTime != null) {
            NumericQuery.QueryType queryType = startTime.determineQueryType();
            if(queryType != null) {
                List<Recording> result = null;
                switch(queryType) {
                    case BOTH:
                        result = recordingRepository.findByStartTimeGreaterThanEqualAndStartTimeLessThanEqual(
                                startTime.getLowerBound(), startTime.getUpperBound()
                        );
                        break;
                    case BOTH_DESC:
                        result = recordingRepository.findByStartTimeGreaterThanEqualAndStartTimeLessThanEqualOrderByStartTimeDesc(
                                startTime.getLowerBound(), startTime.getUpperBound()
                        );
                        break;
                    case GREATER_THAN:
                        result = recordingRepository.findByStartTimeGreaterThanEqual(startTime.getLowerBound());
                        break;
                    case GREATER_THAN_DESC:
                        result = recordingRepository.findByStartTimeGreaterThanEqualOrderByStartTimeDesc(startTime.getLowerBound());
                        break;
                    case LESS_THAN:
                        result = recordingRepository.findByStartTimeLessThanEqual(startTime.getUpperBound());
                        break;
                    case LESS_THAN_DESC:
                        recordingRepository.findByStartTimeLessThanEqualOrderByStartTimeDesc(startTime.getUpperBound());
                        break;
                }

                temp.addAll(result);
                recordings = intersection(recordings, temp);
            }
        }
    }

    private void searchEndTime(NumericQuery endTime) {
        temp = new ArrayList<>();

        if(endTime != null) {
            NumericQuery.QueryType queryType = endTime.determineQueryType();
            if(queryType != null) {
                List<Recording> result = null;
                switch(queryType) {
                    case BOTH:
                        result = recordingRepository.findByEndTimeGreaterThanEqualAndEndTimeLessThanEqual(
                                endTime.getLowerBound(), endTime.getUpperBound()
                        );
                        break;
                    case BOTH_DESC:
                        result = recordingRepository.findByEndTimeGreaterThanEqualAndEndTimeLessThanEqualOrderByEndTimeDesc(
                                endTime.getLowerBound(), endTime.getUpperBound()
                        );
                        break;
                    case GREATER_THAN:
                        result = recordingRepository.findByEndTimeGreaterThanEqual(endTime.getLowerBound());
                        break;
                    case GREATER_THAN_DESC:
                        result = recordingRepository.findByEndTimeGreaterThanEqualOrderByEndTimeDesc(endTime.getLowerBound());
                        break;
                    case LESS_THAN:
                        result = recordingRepository.findByEndTimeLessThanEqual(endTime.getUpperBound());
                        break;
                    case LESS_THAN_DESC:
                        recordingRepository.findByEndTimeLessThanEqualOrderByEndTimeDesc(endTime.getUpperBound());
                        break;
                }

                temp.addAll(result);
                recordings = intersection(recordings, temp);
            }
        }
    }

    private void searchParticipants(NumericQuery participants) {
        temp = new ArrayList<>();

        if(participants != null) {
            NumericQuery.QueryType queryType = participants.determineQueryType();
            if(queryType != null) {
                List<Recording> result = null;
                Integer lowerBound = Math.toIntExact(participants.getLowerBound());
                Integer upperBound = Math.toIntExact(participants.getUpperBound());

                switch(queryType) {
                    case BOTH:
                        result = recordingRepository.findByParticipantsGreaterThanEqualAndParticipantsLessThanEqual(
                                lowerBound, upperBound
                        );
                        break;
                    case BOTH_DESC:
                        result = recordingRepository.findByParticipantsGreaterThanEqualAndParticipantsLessThanEqualOrderByParticipantsDesc(
                                lowerBound, upperBound
                        );
                        break;
                    case GREATER_THAN:
                        result = recordingRepository.findByParticipantsGreaterThanEqual(lowerBound);
                        break;
                    case GREATER_THAN_DESC:
                        result = recordingRepository.findByParticipantsGreaterThanEqualOrderByParticipantsDesc(lowerBound);
                        break;
                    case LESS_THAN:
                        result = recordingRepository.findByParticipantsLessThanEqual(upperBound);
                        break;
                    case LESS_THAN_DESC:
                        recordingRepository.findByParticipantsLessThanEqualOrderByParticipantsDesc(upperBound);
                        break;
                }

                temp.addAll(result);
                recordings = intersection(recordings, temp);
            }
        }
    }

    private void searchRawSize(NumericQuery rawSize) {
        temp = new ArrayList<>();

        if(rawSize != null) {
            NumericQuery.QueryType queryType = rawSize.determineQueryType();
            if(queryType != null) {
                List<Recording> result = null;
                switch(queryType) {
                    case BOTH:
                        result = recordingRepository.findByRawSizeGreaterThanEqualAndRawSizeLessThanEqual(
                                rawSize.getLowerBound(), rawSize.getUpperBound()
                        );
                        break;
                    case BOTH_DESC:
                        result = recordingRepository.findByRawSizeGreaterThanEqualAndRawSizeLessThanEqualOrderByRawSizeDesc(
                                rawSize.getLowerBound(), rawSize.getUpperBound()
                        );
                        break;
                    case GREATER_THAN:
                        result = recordingRepository.findByRawSizeGreaterThanEqual(rawSize.getLowerBound());
                        break;
                    case GREATER_THAN_DESC:
                        result = recordingRepository.findByRawSizeGreaterThanEqualOrderByRawSizeDesc(rawSize.getLowerBound());
                        break;
                    case LESS_THAN:
                        result = recordingRepository.findByRawSizeLessThanEqual(rawSize.getUpperBound());
                        break;
                    case LESS_THAN_DESC:
                        recordingRepository.findByRawSizeLessThanEqualOrderByRawSizeDesc(rawSize.getUpperBound());
                        break;
                }

                temp.addAll(result);
                recordings = intersection(recordings, temp);
            }
        }
    }

    private void searchSize(NumericQuery size) {
        temp = new ArrayList<>();

        if(size != null) {
            NumericQuery.QueryType queryType = size.determineQueryType();
            if(queryType != null) {
                List<Recording> result = null;
                switch(queryType) {
                    case BOTH:
                        result = recordingRepository.findBySizeGreaterThanEqualAndSizeLessThanEqual(
                                size.getLowerBound(), size.getUpperBound()
                        );
                        break;
                    case BOTH_DESC:
                        result = recordingRepository.findBySizeGreaterThanEqualAndSizeLessThanEqualOrderBySizeDesc(
                                size.getLowerBound(), size.getUpperBound()
                        );
                        break;
                    case GREATER_THAN:
                        result = recordingRepository.findBySizeGreaterThanEqual(size.getLowerBound());
                        break;
                    case GREATER_THAN_DESC:
                        result = recordingRepository.findBySizeGreaterThanEqualOrderBySizeDesc(size.getLowerBound());
                        break;
                    case LESS_THAN:
                        result = recordingRepository.findBySizeLessThanEqual(size.getUpperBound());
                        break;
                    case LESS_THAN_DESC:
                        recordingRepository.findBySizeLessThanEqualOrderBySizeDesc(size.getUpperBound());
                        break;
                }

                temp.addAll(result);
                recordings = intersection(recordings, temp);
            }
        }
    }

    private List<Recording> intersection(List<Recording> listA, List<Recording> listB) {
        if(listA.isEmpty()) {
            return new ArrayList<>(listB);
        } else {
            return listA.stream()
                    .distinct()
                    .filter(listB::contains)
                    .collect(Collectors.toList());
        }
    }

    private Page<Recording> recordingListToPage(List<Recording> recordings, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), recordings.size());
        Page<Recording> recordingPage = new PageImpl<>(recordings.subList(start, end), pageable, recordings.size());

        return recordingPage;
    }
}
