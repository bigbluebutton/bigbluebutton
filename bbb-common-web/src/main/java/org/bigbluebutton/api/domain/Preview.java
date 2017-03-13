package org.bigbluebutton.api.domain;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

public class Preview {
  @JacksonXmlElementWrapper(localName = "images")
  @JacksonXmlProperty(localName = "image")
  private Image[] images;

  public void setImages(Image[] images) {
    this.images = images;
  }

  public Image[] getImages() {
    return images;
  }
}
