package org.bigbluebutton.api.domain;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;

@JacksonXmlRootElement(localName = "playback")
public class RecordingMetadataPlayback {
  private String format;
  private String link;

  @JacksonXmlProperty(localName = "processing_time")
  private Long processingTime = 0L;

  private Long duration = 0L;

  private Extensions extensions;

  private String size;

  public void setFormat(String format) {
    this.format = format;
  }

  public String getFormat() {
    return format;
  }

  public void setLink(String link) {
    this.link = link;
  }

  public String getLink() {
    return link;
  }

  public void setProcessingTime(Long processingTime) {
    this.processingTime = processingTime;
  }

  public Long getProcessingTime() {
    return processingTime;
  }

  public void setDuration(Long duration) {
    this.duration = duration;
  }

  public Long getDuration() {
    return duration;
  }

  public Long calculateDuration() {
    if (duration > 0) {
      // convert to minutes
      return duration / 60000;
    } else {
      return 0L;
    }
  }

  public void setExtensions(Extensions extensions) {
    this.extensions = extensions;
  }

  public Extensions getExtensions() {
    return extensions;
  }

  public void setSize(String size) {
    this.size = size;
  }

  public String getSize() {
    return size;
  }
}
