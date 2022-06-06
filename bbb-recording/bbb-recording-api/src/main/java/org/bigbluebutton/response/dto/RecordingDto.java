package org.bigbluebutton.response.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.bigbluebutton.dao.entity.Recording;
import org.springframework.hateoas.RepresentationModel;

import java.time.LocalDateTime;

public class RecordingDto extends RepresentationModel<RecordingDto> {

    private String recordId;
    private String meetingId;
    private String name;
    private boolean published;
    private int participants;
    private String state;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime deletedAt;
    private boolean publishUpdated;
    private boolean isProtected;

    @JsonProperty("meta")
    private MetadataDto metadataDto;

    @JsonProperty("playbackFormat")
    private PlaybackFormatDto playbackFormatDto;

    @JsonProperty("callbackData")
    private CallbackDataDto callbackDataDto;

    public String getRecordId() {
        return recordId;
    }

    public void setRecordId(String recordId) {
        this.recordId = recordId;
    }

    public String getMeetingId() {
        return meetingId;
    }

    public void setMeetingId(String meetingId) {
        this.meetingId = meetingId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean getPublished() {
        return published;
    }

    public void setPublished(Boolean published) {
        this.published = published;
    }

    public Integer getParticipants() {
        return participants;
    }

    public void setParticipants(Integer participants) {
        this.participants = participants;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    public Boolean getPublishUpdated() {
        return publishUpdated;
    }

    public void setPublishUpdated(Boolean publishUpdated) {
        this.publishUpdated = publishUpdated;
    }

    public Boolean getProtected() {
        return isProtected;
    }

    public void setProtected(Boolean aProtected) {
        isProtected = aProtected;
    }

    public MetadataDto getMetadataDto() {
        return metadataDto;
    }

    public void setMetadataDto(MetadataDto metadataDto) {
        this.metadataDto = metadataDto;
    }

    public PlaybackFormatDto getPlaybackFormatDto() {
        return playbackFormatDto;
    }

    public void setPlaybackFormatDto(PlaybackFormatDto playbackFormatDto) {
        this.playbackFormatDto = playbackFormatDto;
    }

    public CallbackDataDto getCallbackDataDto() {
        return callbackDataDto;
    }

    public void setCallbackDataDto(CallbackDataDto callbackDataDto) {
        this.callbackDataDto = callbackDataDto;
    }

    public static RecordingDto recordingToDto(Recording recording) {
        RecordingDto recordingDto = new RecordingDto();

        recordingDto.setRecordId(recording.getRecordId());
        recordingDto.setMeetingId(recording.getMeetingId());
        recordingDto.setName(recording.getName());
        recordingDto.setPublished(recording.getPublished());
        recordingDto.setParticipants(recording.getParticipants());
        recordingDto.setState(recording.getState());
        recordingDto.setStartTime(recording.getStartTime());
        recordingDto.setEndTime(recording.getEndTime());
        recordingDto.setDeletedAt(recording.getDeletedAt());
        recordingDto.setPublishUpdated(recording.getPublishUpdated());
        recordingDto.setProtected(recording.getIsProtected());

        MetadataDto metadataDto = MetadataDto.metadataToDto(recording.getMetadata());
        recordingDto.setMetadataDto(metadataDto);

        PlaybackFormatDto playbackFormatDto = PlaybackFormatDto.playbackFormatToDto(recording.getFormat());
        recordingDto.setPlaybackFormatDto(playbackFormatDto);

        CallbackDataDto callbackDataDto = CallbackDataDto.callbackDataToDto(recording.getCallbackData());
        recordingDto.setCallbackDataDto(callbackDataDto);

        return recordingDto;
    }
}
