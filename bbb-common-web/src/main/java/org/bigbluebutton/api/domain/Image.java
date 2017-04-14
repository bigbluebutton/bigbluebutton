package org.bigbluebutton.api.domain;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlText;

public class Image {

  /**
   * <image width="176" height="136" alt="Welcome to">
   *   http://192.168.23.22/presentation/32ee8bcccfad34f85c58a12f87fc4268130a4fd3-1489173065780/presentation/743dd59a958334b4cdcdaa302846d0c0eadcf9ff-1489173070800/thumbnails/thumb-1.png
   *  </image>
   */

  @JacksonXmlProperty(isAttribute = true)
  private String width;

  @JacksonXmlProperty(isAttribute = true)
  private String height;

  @JacksonXmlProperty(isAttribute = true)
  private String alt;

  @JacksonXmlText
  private String value;


  public void setWidth(String width) {
    this.width = width;
  }

  public String getWidth() {
    return width;
  }

  public void setHeight(String height) {
    this.height = height;
  }

  public String getHeight() {
    return height;
  }

  public void setAlt(String alt) {
    this.alt = alt;
  }

  public String getAlt() {
    return alt;
  }

  public String getValue() {
    return value;
  }

  public void setValue(String value) {
    this.value = value;
  }

}
