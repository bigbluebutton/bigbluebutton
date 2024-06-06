package org.bigbluebutton.api.model.entity;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "playback_formats")
public class PlaybackFormat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "format")
    private String format;

    @Column(name = "url")
    private String url;

    @Column(name = "length")
    private Integer length;

    @Column(name = "processing_time")
    private Integer processingTime;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recording_id", referencedColumnName = "id")
    private Recording recording;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "playbackFormat", fetch = FetchType.EAGER)
    private Set<Thumbnail> thumbnails;

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

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

    public Recording getRecording() {
        return recording;
    }

    public void setRecording(Recording recording) {
        this.recording = recording;
    }

    public Set<Thumbnail> getThumbnails() { return thumbnails; }

    public void setThumbnails(Set<Thumbnail> thumbnails) { this.thumbnails = thumbnails; }

    public void addThumbnail(Thumbnail thumbnail) {
        if(thumbnails == null) {
            thumbnails = new HashSet<>();
        }

        thumbnail.setPlaybackFormat(this);
        thumbnails.add(thumbnail);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        PlaybackFormat format = (PlaybackFormat) o;
        return Objects.equals(this.id, format.id) &&
                Objects.equals(this.format, format.format) &&
                Objects.equals(this.url, format.url) &&
                Objects.equals(this.length, format.length) &&
                Objects.equals(this.processingTime, format.processingTime) &&
                Objects.equals(this.thumbnails, format.thumbnails);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, format, url, length, processingTime, thumbnails);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class PlaybackFormat {\n");
        sb.append("    id: ").append(toIndentedString(id)).append("\n");
        sb.append("    format: ").append(toIndentedString(format)).append("\n");
        sb.append("    url: ").append(toIndentedString(url)).append("\n");
        sb.append("    length: ").append(toIndentedString(length)).append("\n");
        sb.append("    processingTime: ").append(toIndentedString(processingTime)).append("\n");
        sb.append("    thumbnails: ").append(toIndentedString(thumbnails)).append("\n");
        sb.append("}");
        return sb.toString();
    }

    /**
     * Convert the given object to string with each line indented by 4 spaces
     * (except the first line).
     */
    private String toIndentedString(Object o) {
        if (o == null) {
            return "null";
        }
        return o.toString().replace("\n", "\n    ");
    }
}