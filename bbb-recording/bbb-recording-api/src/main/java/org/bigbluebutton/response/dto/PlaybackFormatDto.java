package org.bigbluebutton.response.dto;

import org.bigbluebutton.dao.entity.PlaybackFormat;
import org.bigbluebutton.dao.entity.Thumbnail;

import java.util.*;

public class PlaybackFormatDto {

    private String format;
    private String url;
    private Integer length;
    private Integer processingTime;
    private Set<ThumbnailDto> thumbnails;

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

    public Set<ThumbnailDto> getThumbnails() {
        return thumbnails;
    }

    public void setThumbnails(Set<ThumbnailDto> thumbnails) {
        this.thumbnails = thumbnails;
    }

    public void addThumbnailDto(ThumbnailDto thumbnailDto) {
        if (thumbnails == null)
            thumbnails = new HashSet<>();
        thumbnails.add(thumbnailDto);
    }

    public static PlaybackFormatDto playbackFormatToDto(PlaybackFormat playbackFormat) {
        PlaybackFormatDto playbackFormatDto = new PlaybackFormatDto();

        playbackFormatDto.setFormat(playbackFormat.getFormat());
        playbackFormatDto.setUrl(playbackFormat.getUrl());
        playbackFormatDto.setLength(playbackFormat.getLength());
        playbackFormatDto.setProcessingTime(playbackFormat.getProcessingTime());

        List<Thumbnail> thumbnails = new ArrayList<>(List.copyOf(playbackFormat.getThumbnails()));
        Collections.sort(thumbnails);
        for (Thumbnail thumbnail : thumbnails) {
            ThumbnailDto thumbnailDto = ThumbnailDto.thumbnailToDto(thumbnail);
            playbackFormatDto.addThumbnailDto(thumbnailDto);
        }

        return playbackFormatDto;
    }
}
