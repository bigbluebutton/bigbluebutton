package org.bigbluebutton.dto;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;

@JacksonXmlRootElement(localName = "conference")
public class ConferenceDto {

    @JacksonXmlProperty(isAttribute = true)
    private String id;

    @JacksonXmlProperty(isAttribute = true)
    private String room;
    
    private PresentationDto presentation;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public PresentationDto getPresentation() {
        return presentation;
    }

    public void setPresentation(PresentationDto presentation) {
        this.presentation = presentation;
    }
}
