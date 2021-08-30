package org.bigbluebutton.api.model.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.validation.annotation.Validated;

import java.util.Objects;

@Validated
@Data
public class MeetingRequest {

  @JsonProperty("name")
  private String name = null;

  @JsonProperty("meetingId")
  private String meetingId = null;

  @JsonProperty("voiceBridge")
  private Integer voiceBridge = null;

  @JsonProperty("attendeePw")
  private String attendeePw = null;

  @JsonProperty("moderatorPw")
  private String moderatorPw = null;

  @JsonProperty("isBreakoutRoom")
  private Boolean isBreakoutRoom = null;

  @JsonProperty("record")
  private Boolean record = null;

  public MeetingRequest name(String name) {
    this.name = name;
    return this;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    MeetingRequest meetingRequest = (MeetingRequest) o;
    return Objects.equals(this.name, meetingRequest.name) &&
        Objects.equals(this.meetingId, meetingRequest.meetingId) &&
        Objects.equals(this.voiceBridge, meetingRequest.voiceBridge) &&
        Objects.equals(this.attendeePw, meetingRequest.attendeePw) &&
        Objects.equals(this.moderatorPw, meetingRequest.moderatorPw) &&
        Objects.equals(this.isBreakoutRoom, meetingRequest.isBreakoutRoom) &&
        Objects.equals(this.record, meetingRequest.record);
  }

  @Override
  public int hashCode() {
    return Objects.hash(name, meetingId, voiceBridge, attendeePw, moderatorPw, isBreakoutRoom, record);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class MeetingRequest {\n");
    
    sb.append("    name: ").append(toIndentedString(name)).append("\n");
    sb.append("    meetingId: ").append(toIndentedString(meetingId)).append("\n");
    sb.append("    voiceBridge: ").append(toIndentedString(voiceBridge)).append("\n");
    sb.append("    attendeePw: ").append(toIndentedString(attendeePw)).append("\n");
    sb.append("    moderatorPw: ").append(toIndentedString(moderatorPw)).append("\n");
    sb.append("    isBreakoutRoom: ").append(toIndentedString(isBreakoutRoom)).append("\n");
    sb.append("    record: ").append(toIndentedString(record)).append("\n");
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
