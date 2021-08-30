package org.bigbluebutton.api.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.validation.annotation.Validated;

import javax.persistence.*;
import java.util.Objects;

@Validated
@Entity
@Table(name = "playback")
@Data
public class Playback {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  @JsonIgnore
  private Long id;

  @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
  @JoinColumn(name = "recording_id", referencedColumnName = "id")
  @JsonIgnore
  private Recording recording;

  @JsonProperty("format")
  @OneToOne(mappedBy = "playback", cascade = CascadeType.ALL)
  private PlaybackFormat format;

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Playback playback = (Playback) o;
    return Objects.equals(this.format, playback.format);
  }

  @Override
  public int hashCode() {
    return Objects.hash(format);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class Playback {\n");
    
    sb.append("    format: ").append(toIndentedString(format)).append("\n");
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
