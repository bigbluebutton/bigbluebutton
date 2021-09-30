package org.bigbluebutton.api.model.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.validation.annotation.Validated;

import java.util.Objects;

@Validated
@Data
public class MeetingSearchBody {

  @JsonProperty("filters")
  private MeetingSearchFilters filters = null;

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    MeetingSearchBody meetingsSearchBody = (MeetingSearchBody) o;
    return Objects.equals(this.filters, meetingsSearchBody.filters);
  }

  @Override
  public int hashCode() {
    return Objects.hash(filters);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class MeetingsSearchBody {\n");
    
    sb.append("    filters: ").append(toIndentedString(filters)).append("\n");
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
