package org.bigbluebutton.dao.repository;

import org.bigbluebutton.dao.entity.Recording;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecordingRepository extends JpaRepository<Recording, Long> {

    Optional<Recording> findByRecordId(String recordId);
    List<Recording> findByMeetingId(String meetingId);
    List<Recording> findByState(String state);
}
