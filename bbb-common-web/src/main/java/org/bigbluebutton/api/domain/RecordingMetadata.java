package org.bigbluebutton.api.domain;

import java.util.Map;

import org.bigbluebutton.api2.domain.RecMeta;

public class RecordingMetadata {

  private RecMeta recMeta;

  public void setRecMeta(RecMeta rm) {
    recMeta = rm;
  }

  public RecMeta getRecMeta() {
    return recMeta;
  }

  public void setState(String state) {
    recMeta = recMeta.setState(state);
  }

  public void setPublished(boolean published) {
    recMeta = recMeta.setPublished(published);
  }

  public void setMeta(Map<String, String> meta) {
    recMeta = recMeta.setRecMeta(meta);
  }

  public java.util.Map<String, String> getMeta() {
    return recMeta.getRecMeta();
  }
}
