package org.bigbluebutton.response.dto;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import org.bigbluebutton.dao.entity.Thumbnail;

public class ThumbnailDto {

    @JacksonXmlProperty(isAttribute = true)
    private int height;

    @JacksonXmlProperty(isAttribute = true)
    private int width;

    @JacksonXmlProperty(isAttribute = true)
    private String alt;

    private String url;

    public int getHeight() {
        return height;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
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

    public static ThumbnailDto thumbnailToDto(Thumbnail thumbnail) {
        ThumbnailDto thumbnailDto = new ThumbnailDto();

        thumbnailDto.setHeight(thumbnail.getHeight());
        thumbnailDto.setWidth(thumbnail.getWidth());
        thumbnailDto.setAlt(thumbnail.getAlt());
        thumbnail.setUrl(thumbnail.getUrl());

        return thumbnailDto;
    }
}
