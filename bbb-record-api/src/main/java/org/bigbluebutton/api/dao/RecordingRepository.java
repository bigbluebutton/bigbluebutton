package org.bigbluebutton.api.dao;

import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.core.types.dsl.StringPath;
import org.bigbluebutton.api.model.entity.QRecording;
import org.bigbluebutton.api.model.entity.Recording;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.querydsl.binding.QuerydslBinderCustomizer;
import org.springframework.data.querydsl.binding.QuerydslBindings;
import org.springframework.data.querydsl.binding.SingleValueBinding;

import java.util.List;
import java.util.Optional;

public interface RecordingRepository extends JpaRepository<Recording, String>,
        QuerydslPredicateExecutor<Recording>, QuerydslBinderCustomizer<QRecording> {

    @Override
    default void customize(final QuerydslBindings bindings, final QRecording root) {
        bindings.bind(String.class)
                .first((SingleValueBinding<StringPath, String>) StringExpression::containsIgnoreCase);
        bindings.excluding(root.id, root.internalMeetingId, root.internalMeetingId);
    }

    /*
    *   Recording ID, meeting ID, meeting name, and state queries
    */
    Optional<Recording> findByInternalMeetingId(String internalMeetingId);
    List<Recording> findByMeetingId(String meetingId);
    List<Recording> findByName(String name);
    List<Recording> findByState(String state);

    /*
    *   Boolean field queries
    */
    List<Recording> findByIsBreakoutTrue();
    List<Recording> findByIsBreakoutFalse();
    List<Recording> findByPublishedTrue();
    List<Recording> findByPublishedFalse();

    /*
    *   Start time queries
    */
    List<Recording> findByStartTimeLessThanEqual(Long startTime);
    List<Recording> findByStartTimeLessThanEqualOrderByStartTimeDesc(Long startTime);
    List<Recording> findByStartTimeGreaterThanEqual(Long startTime);
    List<Recording> findByStartTimeGreaterThanEqualOrderByStartTimeDesc(Long startTime);
    List<Recording> findByStartTimeGreaterThanEqualAndStartTimeLessThanEqual(Long startTime, Long startTime2);
    List<Recording> findByStartTimeGreaterThanEqualAndStartTimeLessThanEqualOrderByStartTimeDesc(Long startTime, Long startTime2);

    /*
    *   End time queries
    */
    List<Recording> findByEndTimeLessThanEqual(Long endTime);
    List<Recording> findByEndTimeLessThanEqualOrderByEndTimeDesc(Long endTime);
    List<Recording> findByEndTimeGreaterThanEqual(Long endTime);
    List<Recording> findByEndTimeGreaterThanEqualOrderByEndTimeDesc(Long endTime);
    List<Recording> findByEndTimeGreaterThanEqualAndEndTimeLessThanEqual(Long endTime, Long endTime2);
    List<Recording> findByEndTimeGreaterThanEqualAndEndTimeLessThanEqualOrderByEndTimeDesc(Long endTime, Long endTime2);

    /*
    *   Participants queries
    */
    List<Recording> findByParticipantsLessThanEqual(Integer participants);
    List<Recording> findByParticipantsLessThanEqualOrderByParticipantsDesc(Integer participants);
    List<Recording> findByParticipantsGreaterThanEqual(Integer participants);
    List<Recording> findByParticipantsGreaterThanEqualOrderByParticipantsDesc(Integer participants);
    List<Recording> findByParticipantsGreaterThanEqualAndParticipantsLessThanEqual(Integer participants, Integer participants2);
    List<Recording> findByParticipantsGreaterThanEqualAndParticipantsLessThanEqualOrderByParticipantsDesc(Integer participants, Integer participants2);

    /*
     *   Raw size queries
     */
    List<Recording> findByRawSizeLessThanEqual(Long rawSize);
    List<Recording> findByRawSizeLessThanEqualOrderByRawSizeDesc(Long rawSize);
    List<Recording> findByRawSizeGreaterThanEqual(Long rawSize);
    List<Recording> findByRawSizeGreaterThanEqualOrderByRawSizeDesc(Long rawSize);
    List<Recording> findByRawSizeGreaterThanEqualAndRawSizeLessThanEqual(Long rawSize, Long rawSize2);
    List<Recording> findByRawSizeGreaterThanEqualAndRawSizeLessThanEqualOrderByRawSizeDesc(Long rawSize, Long rawSize2);

    /*
     *   Size queries
     */
    List<Recording> findBySizeLessThanEqual(Long size);
    List<Recording> findBySizeLessThanEqualOrderBySizeDesc(Long size);
    List<Recording> findBySizeGreaterThanEqual(Long size);
    List<Recording> findBySizeGreaterThanEqualOrderBySizeDesc(Long size);
    List<Recording> findBySizeGreaterThanEqualAndSizeLessThanEqual(Long size, Long size2);
    List<Recording> findBySizeGreaterThanEqualAndSizeLessThanEqualOrderBySizeDesc(Long size, Long size2);
}
