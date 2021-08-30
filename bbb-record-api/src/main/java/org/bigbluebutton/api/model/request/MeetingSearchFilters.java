package org.bigbluebutton.api.model.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.validation.annotation.Validated;

import javax.validation.Valid;
import java.util.List;
import java.util.Objects;

@Validated
@Data
public class MeetingSearchFilters {

  @JsonProperty("meetingIds")
  @Valid
  private List<String> meetingIds = null;

  @JsonProperty("roomIds")
  @Valid
  private List<String> roomIds = null;

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    MeetingSearchFilters meetingSearchFilters = (MeetingSearchFilters) o;
    return Objects.equals(this.meetingIds, meetingSearchFilters.meetingIds) &&
        Objects.equals(this.roomIds, meetingSearchFilters.roomIds);
  }

  @Override
  public int hashCode() {
    return Objects.hash(meetingIds, roomIds);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class MeetingSearchFilters {\n");
    
    sb.append("    meetingIds: ").append(toIndentedString(meetingIds)).append("\n");
    sb.append("    roomIds: ").append(toIndentedString(roomIds)).append("\n");
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
