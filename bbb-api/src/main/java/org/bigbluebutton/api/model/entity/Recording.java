package org.bigbluebutton.api.model.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.hateoas.RepresentationModel;
import org.springframework.validation.annotation.Validated;

import javax.persistence.*;
import java.util.Objects;

@Validated
@Entity
@Table(name = "recording")
@Data
public class Recording extends RepresentationModel<Recording> {

  @Id
  @JsonProperty("recordId")
  @Column(name = "id")
  private String id;

  @JsonProperty("meetingId")
  @Column(name = "meeting_id")
  private String meetingId;

  @JsonProperty("internalMeetingId")
  @Column(name = "internal_meeting_id")
  private String internalMeetingId;

  @JsonProperty("name")
  @Column(name = "name")
  private String name;

  @JsonProperty("isBreakout")
  @Column(name = "is_breakout")
  private Boolean isBreakout;

  @JsonProperty("published")
  @Column(name = "published")
  private Boolean published;

  @JsonProperty("state")
  @Column(name = "state")
  private String state;

  @JsonProperty("startTime")
  @Column(name = "start_time")
  private Long startTime;

  @JsonProperty("endTime")
  @Column(name = "end_time")
  private Long endTime;

  @JsonProperty("participants")
  @Column(name = "participants")
  private Integer participants;

  @JsonProperty("rawSize")
  @Column(name = "raw_size")
  private Long rawSize;

  @JsonProperty("metadata")
  @OneToOne(mappedBy = "recording", cascade = CascadeType.ALL)
  private RecordingMetadata metadata;

  @JsonProperty("size")
  @Column(name = "size")
  private Long size;

  @JsonProperty("playback")
  @OneToOne(mappedBy = "recording", cascade = CascadeType.ALL)
  private Playback playback;

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Recording recording = (Recording) o;
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
