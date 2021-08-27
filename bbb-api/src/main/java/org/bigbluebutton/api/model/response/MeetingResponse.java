package org.bigbluebutton.api.model.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.validation.annotation.Validated;

import java.util.Objects;

@Validated
@Data
public class MeetingResponse {

  @JsonProperty("meetingID")
  private String meetingID = null;

  @JsonProperty("internalMeetingID")
  private String internalMeetingID = null;

  @JsonProperty("parentMeetingID")
  private String parentMeetingID = null;

  @JsonProperty("attendeePW")
  private String attendeePW = null;

  @JsonProperty("moderatorPW")
  private String moderatorPW = null;

  @JsonProperty("createTime")
  private Long createTime = null;

  @JsonProperty("voiceBridge")
  private Integer voiceBridge = null;

  @JsonProperty("dialNumber")
  private String dialNumber = null;

  @JsonProperty("createDate")
  private String createDate = null;

  @JsonProperty("hasUserJoined")
  private Boolean hasUserJoined = null;

  @JsonProperty("duration")
  private Integer duration = null;

  @JsonProperty("hasBeenForciblyEnded")
  private Boolean hasBeenForciblyEnded = null;

  @JsonProperty("messageKey")
  private String messageKey = null;

  @JsonProperty("message")
  private String message = null;

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    MeetingResponse meetingResponse = (MeetingResponse) o;
    return Objects.equals(this.meetingID, meetingResponse.meetingID) &&
        Objects.equals(this.internalMeetingID, meetingResponse.internalMeetingID) &&
        Objects.equals(this.parentMeetingID, meetingResponse.parentMeetingID) &&
        Objects.equals(this.attendeePW, meetingResponse.attendeePW) &&
        Objects.equals(this.moderatorPW, meetingResponse.moderatorPW) &&
        Objects.equals(this.createTime, meetingResponse.createTime) &&
        Objects.equals(this.voiceBridge, meetingResponse.voiceBridge) &&
        Objects.equals(this.dialNumber, meetingResponse.dialNumber) &&
        Objects.equals(this.createDate, meetingResponse.createDate) &&
        Objects.equals(this.hasUserJoined, meetingResponse.hasUserJoined) &&
        Objects.equals(this.duration, meetingResponse.duration) &&
        Objects.equals(this.hasBeenForciblyEnded, meetingResponse.hasBeenForciblyEnded) &&
        Objects.equals(this.messageKey, meetingResponse.messageKey) &&
        Objects.equals(this.message, meetingResponse.message);
  }

  @Override
  public int hashCode() {
    return Objects.hash(meetingID, internalMeetingID, parentMeetingID, attendeePW, moderatorPW, createTime, voiceBridge, dialNumber, createDate, hasUserJoined, duration, hasBeenForciblyEnded, messageKey, message);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class MeetingResponse {\n");
    
    sb.append("    meetingID: ").append(toIndentedString(meetingID)).append("\n");
    sb.append("    internalMeetingID: ").append(toIndentedString(internalMeetingID)).append("\n");
    sb.append("    parentMeetingID: ").append(toIndentedString(parentMeetingID)).append("\n");
    sb.append("    attendeePW: ").append(toIndentedString(attendeePW)).append("\n");
    sb.append("    moderatorPW: ").append(toIndentedString(moderatorPW)).append("\n");
    sb.append("    createTime: ").append(toIndentedString(createTime)).append("\n");
    sb.append("    voiceBridge: ").append(toIndentedString(voiceBridge)).append("\n");
    sb.append("    dialNumber: ").append(toIndentedString(dialNumber)).append("\n");
    sb.append("    createDate: ").append(toIndentedString(createDate)).append("\n");
    sb.append("    hasUserJoined: ").append(toIndentedString(hasUserJoined)).append("\n");
    sb.append("    duration: ").append(toIndentedString(duration)).append("\n");
    sb.append("    hasBeenForciblyEnded: ").append(toIndentedString(hasBeenForciblyEnded)).append("\n");
    sb.append("    messageKey: ").append(toIndentedString(messageKey)).append("\n");
    sb.append("    message: ").append(toIndentedString(message)).append("\n");
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
