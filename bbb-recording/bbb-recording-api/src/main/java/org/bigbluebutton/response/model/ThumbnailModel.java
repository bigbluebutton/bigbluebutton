package org.bigbluebutton.response.model;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import org.bigbluebutton.dao.entity.Thumbnail;

public class ThumbnailModel {

    @JacksonXmlProperty(isAttribute = true)
    private Integer height;

    @JacksonXmlProperty(isAttribute = true)
    private Integer width;

    @JacksonXmlProperty(isAttribute = true)
    private String alt;

    private String url;

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public Integer getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public String getAlt() {
        return alt;
    }

    public void setAlt(String alt) {
        this.alt = alt;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public static ThumbnailModel toModel(Thumbnail thumbnail) {
        if (thumbnail == null)
            return null;

        ThumbnailModel thumbnailModel = new ThumbnailModel();

        thumbnailModel.setHeight(thumbnail.getHeight());
        thumbnailModel.setWidth(thumbnail.getWidth());
        thumbnailModel.setAlt(thumbnail.getAlt());
        thumbnail.setUrl(thumbnail.getUrl());

        return thumbnailModel;
    }
}
