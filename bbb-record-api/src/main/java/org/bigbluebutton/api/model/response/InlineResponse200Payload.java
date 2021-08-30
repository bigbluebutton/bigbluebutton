package org.bigbluebutton.api.model.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.validation.annotation.Validated;

import javax.validation.Valid;
import java.util.List;
import java.util.Objects;

@Validated
@Data
public class InlineResponse200Payload {

//  @JsonProperty("meeting")
//  private MeetingResponse meeting = null;
//
//  @JsonProperty("links")
//  @Valid
//  private List<Link> links = null;
//
//  @Override
//  public boolean equals(Object o) {
//    if (this == o) {
//      return true;
//    }
//    if (o == null || getClass() != o.getClass()) {
//      return false;
//    }
//    InlineResponse200Payload inlineResponse200Payload = (InlineResponse200Payload) o;
//    return Objects.equals(this.meeting, inlineResponse200Payload.meeting) &&
//        Objects.equals(this.links, inlineResponse200Payload.links);
//  }
//
//  @Override
//  public int hashCode() {
//    return Objects.hash(meeting, links);
//  }
//
//  @Override
//  public String toString() {
//    StringBuilder sb = new StringBuilder();
//    sb.append("class InlineResponse200Payload {\n");
//
//    sb.append("    meeting: ").append(toIndentedString(meeting)).append("\n");
//    sb.append("    links: ").append(toIndentedString(links)).append("\n");
//    sb.append("}");
//    return sb.toString();
//  }
//
//  /**
//   * Convert the given object to string with each line indented by 4 spaces
//   * (except the first line).
//   */
//  private String toIndentedString(Object o) {
//    if (o == null) {
//      return "null";
//    }
//    return o.toString().replace("\n", "\n    ");
//  }
}
