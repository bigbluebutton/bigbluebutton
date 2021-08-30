package org.bigbluebutton.api.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.validation.annotation.Validated;

import javax.persistence.*;
import javax.validation.Valid;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Validated
@Entity
@Table(name = "playback_format_preview")
@Data
public class PlaybackFormatPreview {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  @JsonIgnore
  private Long id;

  @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
  @JoinColumn(name = "format_id", referencedColumnName = "id")
  @JsonIgnore
  private PlaybackFormat format;

  @JsonProperty("images")
  @Valid
  @OneToMany(cascade = CascadeType.ALL, mappedBy = "preview")
  private Set<RecordingImage> images;

  public void addImage(RecordingImage image) {
    if(images == null) {
      images = new HashSet<>();
    }

    images.add(image);
    image.setPreview(this);
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    PlaybackFormatPreview playbackFormatPreview = (PlaybackFormatPreview) o;
    return Objects.equals(this.images, playbackFormatPreview.images);
  }

  @Override
  public int hashCode() {
    return Objects.hash(images);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class PlaybackFormatPreview {\n");
    
    sb.append("    images: ").append(toIndentedString(images)).append("\n");
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
