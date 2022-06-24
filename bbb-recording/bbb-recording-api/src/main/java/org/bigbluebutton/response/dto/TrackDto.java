package org.bigbluebutton.response.dto;

import org.bigbluebutton.dao.entity.Track;

public class TrackDto {

    private String href;
    private String kind;
    private String label;
    private String lang;
    private String source;

    public String getHref() {
        return href;
    }

    public void setHref(String href) {
        this.href = href;
    }

    public String getKind() {
        return kind;
    }

    public void setKind(String kind) {
        this.kind = kind;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getLang() {
        return lang;
    }

    public void setLang(String lang) {
        this.lang = lang;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public static TrackDto trackToDto(Track track) {
        TrackDto trackDto = new TrackDto();

        trackDto.setHref(track.getHref());
        trackDto.setKind(track.getKind());
        trackDto.setLabel(track.getLabel());
        trackDto.setLang(track.getLang());
        trackDto.setSource(track.getSource());

        return trackDto;
    }
}
