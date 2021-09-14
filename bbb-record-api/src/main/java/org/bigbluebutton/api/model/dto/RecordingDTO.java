package org.bigbluebutton.api.model.dto;

import com.fasterxml.jackson.annotation.JsonView;
import org.bigbluebutton.api.model.entity.Playback;
import org.bigbluebutton.api.model.entity.RecordingMetadata;

import java.util.Objects;

public class RecordingDTO {

    @JsonView(View.GetView.class)
    private String id;

    @JsonView(View.PatchView.class)
    private String meetingId;

    @JsonView(View.PatchView.class)
    private String internalMeetingId;

    @JsonView(View.PatchView.class)
    private String name;

    @JsonView(View.PatchView.class)
    private Boolean isBreakout;

    @JsonView(View.PatchView.class)
    private Boolean published;

    @JsonView(View.PatchView.class)
    private String state;

    @JsonView(View.PatchView.class)
    private Long startTime;

    @JsonView(View.PatchView.class)
    private Long endTime;

    @JsonView(View.PatchView.class)
    private Integer participants;

    @JsonView(View.PatchView.class)
    private Long rawSize;

    @JsonView(View.GetView.class)
    private RecordingMetadata metadata;

    @JsonView(View.PatchView.class)
    private Long size;

    @JsonView(View.GetView.class)
    private Playback playback;

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        RecordingDTO recording = (RecordingDTO) o;
        return Objects.equals(this.id, recording.id) &&
                Objects.equals(this.meetingId, recording.meetingId) &&
                Objects.equals(this.internalMeetingId, recording.internalMeetingId) &&
                Objects.equals(this.name, recording.name) &&
                Objects.equals(this.isBreakout, recording.isBreakout) &&
                Objects.equals(this.published, recording.published) &&
                Objects.equals(this.state, recording.state) &&
                Objects.equals(this.startTime, recording.startTime) &&
                Objects.equals(this.endTime, recording.endTime) &&
                Objects.equals(this.participants, recording.participants) &&
                Objects.equals(this.rawSize, recording.rawSize) &&
                Objects.equals(this.metadata, recording.metadata) &&
                Objects.equals(this.size, recording.size) &&
                Objects.equals(this.playback, recording.playback);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, meetingId, internalMeetingId, name, isBreakout, published, state, startTime, endTime, participants, rawSize, metadata, size, playback);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class Recording {\n");

        sb.append("    Id: ").append(toIndentedString(id)).append("\n");
        sb.append("    meetingId: ").append(toIndentedString(meetingId)).append("\n");
        sb.append("    internalMeetingId: ").append(toIndentedString(internalMeetingId)).append("\n");
        sb.append("    name: ").append(toIndentedString(name)).append("\n");
        sb.append("    isBreakout: ").append(toIndentedString(isBreakout)).append("\n");
        sb.append("    published: ").append(toIndentedString(published)).append("\n");
        sb.append("    state: ").append(toIndentedString(state)).append("\n");
        sb.append("    startTime: ").append(toIndentedString(startTime)).append("\n");
        sb.append("    endTime: ").append(toIndentedString(endTime)).append("\n");
        sb.append("    participants: ").append(toIndentedString(participants)).append("\n");
        sb.append("    rawSize: ").append(toIndentedString(rawSize)).append("\n");
        sb.append("    metadata: ").append(toIndentedString(metadata)).append("\n");
        sb.append("    size: ").append(toIndentedString(size)).append("\n");
        sb.append("    playback: ").append(toIndentedString(playback)).append("\n");
        sb.append("}");
        return sb.toString();
    }

    /**
     * Convert the given object to string with each line indented by 4 spaces
     * (except the first line).
     */
    private String toIndentedString(Object o) {
        if (o == null) {
            return "null";
        }
        return o.toString().replace("\n", "\n    ");
    }
}
