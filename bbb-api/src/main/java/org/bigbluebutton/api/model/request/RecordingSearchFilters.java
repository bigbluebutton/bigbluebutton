package org.bigbluebutton.api.model.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.validation.annotation.Validated;

import javax.validation.Valid;
import java.util.List;
import java.util.Objects;

@Validated
@Data
public class RecordingSearchFilters {

    @JsonProperty("recordingIds")
    @Valid
    private List<String> recordingIds;

    @JsonProperty("internalMeetingIds")
    @Valid
    private List<String> internalMeetingIds;

    @JsonProperty("meetingIds")
    @Valid
    private List<String> meetingIds;

    @JsonProperty("names")
    @Valid
    private List<String> names;

    @JsonProperty("isBreakout")
    @Valid
    private Boolean isBreakout;

    @JsonProperty("published")
    @Valid
    private Boolean published;

    @JsonProperty("state")
    @Valid
    private String state;

    @JsonProperty("startTime")
    @Valid
    private NumericQuery startTime;

    @JsonProperty("endTime")
    @Valid
    private NumericQuery endTime;

    @JsonProperty("participants")
    @Valid
    private NumericQuery participants;

    @JsonProperty("rawSize")
    @Valid
    private NumericQuery rawSize;

    @JsonProperty("size")
    @Valid
    private NumericQuery size;

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        RecordingSearchFilters recordingSearchFilters = (RecordingSearchFilters) o;
        return Objects.equals(this.recordingIds, recordingSearchFilters.recordingIds) &&
                Objects.equals(this.internalMeetingIds, recordingSearchFilters.internalMeetingIds) &&
                Objects.equals(this.meetingIds, recordingSearchFilters.meetingIds) &&
                Objects.equals(this.names, recordingSearchFilters.names) &&
                Objects.equals(this.isBreakout, recordingSearchFilters.isBreakout) &&
                Objects.equals(this.published, recordingSearchFilters.published) &&
                Objects.equals(this.state, recordingSearchFilters.state) &&
                Objects.equals(this.startTime, recordingSearchFilters.startTime) &&
                Objects.equals(this.endTime, recordingSearchFilters.endTime) &&
                Objects.equals(this.participants, recordingSearchFilters.participants) &&
                Objects.equals(this.rawSize, recordingSearchFilters.rawSize) &&
                Objects.equals(this.size, recordingSearchFilters.size);
    }

    @Override
    public int hashCode() {
        return Objects.hash(recordingIds, internalMeetingIds, meetingIds, names, isBreakout, published, state,
                startTime, endTime, participants, rawSize, size);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class RecordingSearchFilters {\n");

        sb.append("    recordingIds: ").append(toIndentedString(recordingIds)).append("\n");
        sb.append("    internalMeetingIds: ").append(toIndentedString(internalMeetingIds)).append("\n");
        sb.append("    meetingIds: ").append(toIndentedString(meetingIds)).append("\n");
        sb.append("    names: ").append(toIndentedString(names)).append("\n");
        sb.append("    isBreakout: ").append(toIndentedString(isBreakout)).append("\n");
        sb.append("    published: ").append(toIndentedString(published)).append("\n");
        sb.append("    state: ").append(toIndentedString(state)).append("\n");
        sb.append("    startTime: ").append(toIndentedString(startTime)).append("\n");
        sb.append("    endTime: ").append(toIndentedString(endTime)).append("\n");
        sb.append("    participants: ").append(toIndentedString(participants)).append("\n");
        sb.append("    rawSize: ").append(toIndentedString(rawSize)).append("\n");
        sb.append("    size: ").append(toIndentedString(size)).append("\n");
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
