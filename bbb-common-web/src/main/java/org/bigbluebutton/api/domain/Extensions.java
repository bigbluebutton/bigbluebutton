package org.bigbluebutton.api.domain;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

/**
 * Created by ritz on 2017-03-11.
 */
public class Extensions {
  @JacksonXmlProperty(localName = "preview")
  @JacksonXmlElementWrapper(useWrapping = false)
  private Preview preview;

  public void setPreview(Preview preview) {
    this.preview = preview;
  }

  public Preview getPreview() {
    return preview;
  }
}
