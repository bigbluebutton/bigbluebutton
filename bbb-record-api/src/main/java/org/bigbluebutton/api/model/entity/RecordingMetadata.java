package org.bigbluebutton.api.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.validation.annotation.Validated;

import javax.persistence.*;
import java.util.Objects;

@Validated
@Entity
@Table(name = "recording_metadata")
@Data
public class RecordingMetadata {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  @JsonIgnore
  private Long id;

  @JsonProperty("bbb-origin-version")
  @Column(name = "bbb_origin_version")
  private String bbbOriginVersion;

  @JsonProperty("meetingName")
  @Column(name = "meeting_name")
  private String meetingName;

  @JsonProperty("meetingId")
  @Column(name = "meeting_id")
  private String meetingId;

  @JsonProperty("gl-listed")
  @Column(name = "gl_listed")
  private Boolean glListed;

  @JsonProperty("bbb-origin")
  @Column(name = "bbb_origin")
  private String bbbOrigin;

  @JsonProperty("isBreakout")
  @Column(name = "is_breakout")
  private Boolean isBreakout;

  @JsonProperty("bbb-origin-server-name")
  @Column(name = "bbb_origin_server_name")
  private String bbbOriginServerName;

  @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
  @JoinColumn(name = "recording_id", referencedColumnName = "id")
  @JsonIgnore
  private Recording recording;

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    RecordingMetadata recordingMetadata = (RecordingMetadata) o;
    return Objects.equals(this.bbbOriginVersion, recordingMetadata.bbbOriginVersion) &&
        Objects.equals(this.meetingName, recordingMetadata.meetingName) &&
        Objects.equals(this.meetingId, recordingMetadata.meetingId) &&
        Objects.equals(this.glListed, recordingMetadata.glListed) &&
        Objects.equals(this.bbbOrigin, recordingMetadata.bbbOrigin) &&
        Objects.equals(this.isBreakout, recordingMetadata.isBreakout) &&
        Objects.equals(this.bbbOriginServerName, recordingMetadata.bbbOriginServerName);
  }

  @Override
  public int hashCode() {
    return Objects.hash(bbbOriginVersion, meetingName, meetingId, glListed, bbbOrigin, isBreakout, bbbOriginServerName);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class RecordingMetadata {\n");
    
    sb.append("    bbbOriginVersion: ").append(toIndentedString(bbbOriginVersion)).append("\n");
    sb.append("    meetingName: ").append(toIndentedString(meetingName)).append("\n");
    sb.append("    meetingId: ").append(toIndentedString(meetingId)).append("\n");
    sb.append("    glListed: ").append(toIndentedString(glListed)).append("\n");
    sb.append("    bbbOrigin: ").append(toIndentedString(bbbOrigin)).append("\n");
    sb.append("    isBreakout: ").append(toIndentedString(isBreakout)).append("\n");
    sb.append("    bbbOriginServerName: ").append(toIndentedString(bbbOriginServerName)).append("\n");
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
