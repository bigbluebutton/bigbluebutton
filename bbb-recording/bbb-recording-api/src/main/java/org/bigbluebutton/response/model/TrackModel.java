package org.bigbluebutton.response.model;

import org.bigbluebutton.dao.entity.Track;
import org.springframework.hateoas.RepresentationModel;

public class TrackModel extends RepresentationModel<TrackModel> {

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

    public static TrackModel toModel(Track track) {
        if (track == null)
            return null;

        TrackModel trackModel = new TrackModel();

        trackModel.setHref(track.getHref());
        trackModel.setKind(track.getKind());
        trackModel.setLabel(track.getLabel());
        trackModel.setLang(track.getLang());
        trackModel.setSource(track.getSource());

        return trackModel;
    }
}
