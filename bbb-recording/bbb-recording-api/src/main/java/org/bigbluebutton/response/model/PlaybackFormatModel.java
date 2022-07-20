package org.bigbluebutton.response.model;

import org.bigbluebutton.dao.entity.PlaybackFormat;
import org.bigbluebutton.dao.entity.Thumbnail;

import java.util.*;

public class PlaybackFormatModel {

    private String format;
    private String url;
    private Integer length;
    private Integer processingTime;
    private Set<ThumbnailModel> thumbnails;

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Integer getLength() {
        return length;
    }

    public void setLength(Integer length) {
        this.length = length;
    }

    public Integer getProcessingTime() {
        return processingTime;
    }

    public void setProcessingTime(Integer processingTime) {
        this.processingTime = processingTime;
    }

    public Set<ThumbnailModel> getThumbnails() {
        return thumbnails;
    }

    public void setThumbnails(Set<ThumbnailModel> thumbnails) {
        this.thumbnails = thumbnails;
    }

    public void addThumbnailDto(ThumbnailModel thumbnailDto) {
        if (thumbnails == null)
            thumbnails = new HashSet<>();
        thumbnails.add(thumbnailDto);
    }

    public static PlaybackFormatModel toModel(PlaybackFormat playbackFormat) {
        if (playbackFormat == null)
            return null;

        PlaybackFormatModel playbackFormatModel = new PlaybackFormatModel();

        playbackFormatModel.setFormat(playbackFormat.getFormat());
        playbackFormatModel.setUrl(playbackFormat.getUrl());
        playbackFormatModel.setLength(playbackFormat.getLength());
        playbackFormatModel.setProcessingTime(playbackFormat.getProcessingTime());

        List<Thumbnail> thumbnails = new ArrayList<>(List.copyOf(playbackFormat.getThumbnails()));
        Collections.sort(thumbnails);
        for (Thumbnail thumbnail : thumbnails) {
            ThumbnailModel thumbnailDto = ThumbnailModel.toModel(thumbnail);
            playbackFormatModel.addThumbnailDto(thumbnailDto);
        }

        return playbackFormatModel;
    }
}
