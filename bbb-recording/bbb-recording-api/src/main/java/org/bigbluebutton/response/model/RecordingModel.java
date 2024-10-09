package org.bigbluebutton.response.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.bigbluebutton.dao.entity.Recording;
import org.bigbluebutton.rest.v2.RecordingApiControllerV2;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.RepresentationModel;

import java.time.LocalDateTime;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

public class RecordingModel extends RepresentationModel<RecordingModel> {

    private String recordId;
    private String meetingId;
    private String name;
    private Boolean published;
    private Integer participants;
    private String state;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime deletedAt;
    private Boolean publishUpdated;
    private Boolean isProtected;

    @JsonProperty("meta")
    private MetadataModel metadataDto;

    @JsonProperty("playbackFormat")
    private PlaybackFormatModel playbackFormatDto;

    @JsonProperty("callbackData")
    private CallbackDataModel callbackDataDto;

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

    public MetadataModel getMetadataDto() {
        return metadataDto;
    }

    public void setMetadataDto(MetadataModel metadataDto) {
        this.metadataDto = metadataDto;
    }

    public PlaybackFormatModel getPlaybackFormatDto() {
        return playbackFormatDto;
    }

    public void setPlaybackFormatDto(PlaybackFormatModel playbackFormatDto) {
        this.playbackFormatDto = playbackFormatDto;
    }

    public CallbackDataModel getCallbackDataDto() {
        return callbackDataDto;
    }

    public void setCallbackDataDto(CallbackDataModel callbackDataDto) {
        this.callbackDataDto = callbackDataDto;
    }

    public static RecordingModel toModel(Recording recording) {
        RecordingModel recordingModel = new RecordingModel();

        recordingModel.setRecordId(recording.getRecordId());
        recordingModel.setMeetingId(recording.getMeetingId());
        recordingModel.setName(recording.getName());
        recordingModel.setPublished(recording.getPublished());
        recordingModel.setParticipants(recording.getParticipants());
        recordingModel.setState(recording.getState());
        recordingModel.setStartTime(recording.getStartTime());
        recordingModel.setEndTime(recording.getEndTime());
        recordingModel.setDeletedAt(recording.getDeletedAt());
        recordingModel.setPublishUpdated(recording.getPublishUpdated());
        recordingModel.setProtected(recording.getIsProtected());

        MetadataModel metadataDto = MetadataModel.toModel(recording.getMetadata());
        recordingModel.setMetadataDto(metadataDto);

        PlaybackFormatModel playbackFormatDto = PlaybackFormatModel.toModel(recording.getFormat());
        recordingModel.setPlaybackFormatDto(playbackFormatDto);

        CallbackDataModel callbackDataDto = CallbackDataModel.toModel(recording.getCallbackData());
        recordingModel.setCallbackDataDto(callbackDataDto);

        recordingModel.addLinks();

        return recordingModel;
    }

    private void addLinks() {
        Link selfLink = linkTo(RecordingApiControllerV2.class).slash("recordings").slash(this.getRecordId())
                .withSelfRel();
        add(selfLink);

        Link tracksLink = linkTo(methodOn(RecordingApiControllerV2.class).getRecordingTextTracks(recordId, null, null))
                .withRel("tracks");
        add(tracksLink);
    }
}
