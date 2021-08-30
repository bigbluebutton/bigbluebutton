package org.bigbluebutton.api.model.entity;

import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import lombok.Data;
import org.springframework.validation.annotation.Validated;

import javax.persistence.*;

@Validated
@Entity
@Table(name = "recording_image")
@Data
public class RecordingImage {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  @JsonIgnore
  private Long id;

  @JsonProperty("alt")
  @Column(name = "alt")
  @JacksonXmlProperty(isAttribute = true)
  private String alt;

  @JsonProperty("height")
  @Column(name = "height")
  @JacksonXmlProperty(isAttribute = true)
  private Integer height;

  @JsonProperty("width")
  @Column(name = "width")
  @JacksonXmlProperty(isAttribute = true)
  private Integer width;

  @JsonProperty("src")
  @Column(name = "src")
  @JacksonXmlProperty(isAttribute = true)
  private String src;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "preview_id")
  @JsonIgnore
  private PlaybackFormatPreview preview;

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    RecordingImage image = (RecordingImage) o;
    return Objects.equals(this.alt, image.alt) &&
        Objects.equals(this.height, image.height) &&
        Objects.equals(this.width, image.width) &&
        Objects.equals(this.src, image.src);
  }

  @Override
  public int hashCode() {
    return Objects.hash(alt, height, width, src);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Image {\n");
    
    sb.append("    alt: ").append(toIndentedString(alt)).append("\n");
    sb.append("    height: ").append(toIndentedString(height)).append("\n");
    sb.append("    width: ").append(toIndentedString(width)).append("\n");
    sb.append("    href: ").append(toIndentedString(src)).append("\n");
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
