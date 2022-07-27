package org.bigbluebutton.service.impl;

import org.bigbluebutton.dao.entity.Events;
import org.bigbluebutton.dao.entity.Metadata;
import org.bigbluebutton.dao.entity.Recording;
import org.bigbluebutton.dao.entity.Track;
import org.bigbluebutton.dao.repository.MetadataRepository;
import org.bigbluebutton.dao.repository.RecordingRepository;
import org.bigbluebutton.service.RecordingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.*;

@Service
public class RecordingServiceDbImpl implements RecordingService {

    private static final Logger logger = LoggerFactory.getLogger(RecordingServiceDbImpl.class);

    @Value("${bbb.recording.captionsDir}")
    private String captionsDir;

    @Value("${bbb.web.defaultTextTrackUrl}")
    private String defaultTextTrackUrl;

    private final RecordingRepository recordingRepository;
    private final MetadataRepository metadataRepository;

    public RecordingServiceDbImpl(RecordingRepository recordingRepository, MetadataRepository metadataRepository) {
        this.recordingRepository = recordingRepository;
        this.metadataRepository = metadataRepository;
    }

    @Override
    public String getType() {
        return "db";
    }

    @Override
    public List<Recording> searchRecordings(List<String> meetingIds, List<String> recordIds, List<String> states,
            Map<String, String> meta) {
        logger.info("Retrieving all recordings");
        Set<Recording> recordings = new HashSet<>(recordingRepository.findAll());

        if (meetingIds.size() > 0) {
            Set<Recording> recordingsByMeetingId = new HashSet<>();
            for (String id : meetingIds) {
                List<Recording> r = recordingRepository.findByMeetingId(id);
                if (r != null)
                    recordingsByMeetingId.addAll(r);
            }

            logger.info("Filtering recordings by meeting ID");
            recordings.retainAll(recordingsByMeetingId);
            logger.info("{} recordings remaining", recordings.size());
        }

        if (recordIds.size() > 0) {
            Set<Recording> recordingsByRecordId = new HashSet<>();
            for (String id : recordIds) {
                Optional<Recording> recording = recordingRepository.findByRecordId(id);
                recording.ifPresent(recordingsByRecordId::add);
            }

            logger.info("Filtering recordings by recording ID");
            recordings.retainAll(recordingsByRecordId);
            logger.info("{} recordings remaining", recordings.size());
        }

        if (states.size() > 0) {
            Set<Recording> recordingsByState = new HashSet<>();
            for (String state : states) {
                List<Recording> r = recordingRepository.findByState(state);
                if (r != null)
                    recordingsByState.addAll(r);
            }

            logger.info("Filtering recordings by state");
            recordings.retainAll(recordingsByState);
            logger.info("{} recordings remaining", recordings.size());
        }

        if (meta.size() > 0) {
            List<Metadata> metadata = new ArrayList<>();
            for (Map.Entry<String, String> filter : meta.entrySet()) {
                List<Metadata> m = metadataRepository.findByKeyAndValue(filter.getKey(), filter.getValue());
                if (m != null)
                    metadata.addAll(m);
            }

            Set<Recording> recordingsByMetadata = new HashSet<>();
            for (Metadata m : metadata) {
                recordingsByMetadata.add(m.getRecording());
            }

            logger.info("Filtering recordings by metadata");
            recordings.retainAll(recordingsByMetadata);
            logger.info("{} recordings remaining", recordings.size());
        }

        return List.copyOf(recordings);
    }

    @Override
    public Recording findRecording(String recordId) {
        Optional<Recording> recording = recordingRepository.findByRecordId(recordId);
        return recording.orElse(null);
    }

    @Override
    public Recording updateRecording(String recordId, Map<String, String> meta) {
        Optional<Recording> optional = recordingRepository.findByRecordId(recordId);

        if (optional.isPresent()) {
            Recording recording = optional.get();
            Set<Metadata> metadata = recording.getMetadata();

            for (Map.Entry<String, String> entry : meta.entrySet()) {
                for (Metadata m : metadata) {
                    if (m.getKey().equals(entry.getKey())) {
                        m.setValue(entry.getValue());
                    } else {
                        Metadata newParam = new Metadata();
                        newParam.setKey(entry.getKey());
                        newParam.setValue(entry.getValue());
                        newParam.setRecording(recording);
                        recording.addMetadata(newParam);
                    }
                }
            }

            recordingRepository.save(recording);
            return recording;
        }

        return null;
    }

    @Override
    public Recording publishRecording(String recordId, boolean publish) {
        Optional<Recording> optional = recordingRepository.findByRecordId(recordId);

        if (optional.isPresent()) {
            Recording recording = optional.get();
            recording.setPublished(publish);
            String state = (publish) ? Recording.State.PUBLISHED.getValue() : Recording.State.UNPUBLISHED.getValue();
            recording.setState(state);
            recordingRepository.save(recording);
            return recording;
        }

        return null;
    }

    @Override
    public boolean deleteRecording(String recordId) {
        Optional<Recording> recording = recordingRepository.findByRecordId(recordId);

        if (recording.isPresent()) {
            recordingRepository.delete(recording.get());
            return true;
        }

        return false;
    }

    @Override
    public List<Track> getTracks(String recordId) {
        Optional<Recording> optional = recordingRepository.findByRecordId(recordId);

        if (optional.isPresent()) {
            Recording recording = optional.get();
            List<Track> tracks = new ArrayList<>();
            if (recording.getTracks() != null)
                tracks.addAll(recording.getTracks());
            return tracks;
        }

        return null;
    }

    @Override
    public boolean putTrack(MultipartFile file, String recordId, String kind, String lang, String label) {
        String contentType = file.getContentType();
        String originalFileName = file.getOriginalFilename();
        String trackId = recordId + "-" + System.currentTimeMillis();
        String tempFileName = trackId + "-track.txt";
        String captionsFilePath = captionsDir + File.separatorChar + "inbox" + File.separatorChar + tempFileName;

        try {
            File captionsFile = new File(captionsFilePath);
            file.transferTo(captionsFile);

            Track track = new Track();
            track.setKind(kind);
            track.setLang(lang);
            track.setLabel(label);
            track.setOriginalName(originalFileName);
            track.setTempName(tempFileName);
            track.setContentType(contentType);
            track.setSource("upload");

            String captionFileUrlDirectory = defaultTextTrackUrl + "/textTrack/";
            String caption = kind + "_" + lang + ".vtt";
            track.setHref(captionFileUrlDirectory + recordId + "/" + caption);

            Optional<Recording> optional = recordingRepository.findByRecordId(recordId);
            if (optional.isPresent()) {
                if (saveTrackInfoFile(track, trackId, captionsDir)) {
                    Recording recording = optional.get();
                    track.setRecording(recording);
                    recording.addTrack(track);
                    recordingRepository.save(recording);
                    return true;
                }
            }

            return false;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public Events getEvents(String recordId) {
        Optional<Recording> optional = recordingRepository.findByRecordId(recordId);

        if (optional.isPresent()) {
            Recording recording = optional.get();
            return recording.getEvents();
        }

        return null;
    }
}
