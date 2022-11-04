package org.bigbluebutton.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

public class PresentationDto {

    @JacksonXmlProperty(isAttribute = true)
    private String name;

    @JsonProperty("content")
    @JacksonXmlProperty(localName = "content")
    private ContentDto content;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ContentDto getContent() {
        return content;
    }

    public void setContent(ContentDto content) {
        this.content = content;
    }
}
