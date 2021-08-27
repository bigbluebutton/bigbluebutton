package org.bigbluebutton.api.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.validation.annotation.Validated;

import javax.persistence.*;
import java.util.Objects;


@Validated
@Entity
@Table(name = "playback_format")
@Data
public class PlaybackFormat {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  @JsonIgnore
  private Long id;

  @JsonProperty("type")
  @Column(name = "type")
  private String type;

  @JsonProperty("url")
  @Column(name = "url")
  private String url;

  @JsonProperty("processingTime")
  @Column(name = "processing_time")
  private Integer processingTime;

  @JsonProperty("length")
  @Column(name = "length")
  private Integer length;

  @JsonProperty("size")
  @Column(name = "size")
  private Long size;

  @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
  @JoinColumn(name = "playback_id", referencedColumnName = "id")
  @JsonIgnore
  private Playback playback;

  @JsonProperty("preview")
  @OneToOne(mappedBy = "format", cascade = CascadeType.ALL)
  private PlaybackFormatPreview preview;

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    PlaybackFormat playbackFormat = (PlaybackFormat) o;
    return Objects.equals(this.type, playbackFormat.type) &&
        Objects.equals(this.url, playbackFormat.url) &&
        Objects.equals(this.processingTime, playbackFormat.processingTime) &&
        Objects.equals(this.length, playbackFormat.length) &&
        Objects.equals(this.size, playbackFormat.size) &&
        Objects.equals(this.preview, playbackFormat.preview);
  }

  @Override
  public int hashCode() {
    return Objects.hash(type, url, processingTime, length, size, preview);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class PlaybackFormat {\n");
    
    sb.append("    type: ").append(toIndentedString(type)).append("\n");
    sb.append("    url: ").append(toIndentedString(url)).append("\n");
    sb.append("    processingTime: ").append(toIndentedString(processingTime)).append("\n");
    sb.append("    length: ").append(toIndentedString(length)).append("\n");
    sb.append("    size: ").append(toIndentedString(size)).append("\n");
    sb.append("    preview: ").append(toIndentedString(preview)).append("\n");
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
