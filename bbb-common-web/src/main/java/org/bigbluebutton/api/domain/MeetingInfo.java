package org.bigbluebutton.api.domain;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

public class MeetingInfo {
  /**
   * <meeting id="random-2810069" name="random-2810069" breakout="false"/>
   */
  @JacksonXmlProperty(isAttribute = true)
  private String id;

  @JacksonXmlProperty(isAttribute = true)
  private String externalId;

  @JacksonXmlProperty(isAttribute = true)
  private String name;

  @JacksonXmlProperty(isAttribute = true)
  private boolean breakout;


  public void setId(String id) {
    this.id = id;
  }

  public String getId() {
    return id;
  }

  public void setExternalId(String externalId) {
    this.externalId = externalId;
  }

  public String getExternalId() {
    return externalId;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getName() {
    return name;
  }

  public void setBreakout(boolean breakout) {
    this.breakout = breakout;
  }

  public boolean isBreakout() {
    return breakout;
  }
}
