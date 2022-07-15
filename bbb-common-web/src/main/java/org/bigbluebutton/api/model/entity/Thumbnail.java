package org.bigbluebutton.api.model.entity;

import javax.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "thumbnails")
public class Thumbnail implements Comparable<Thumbnail> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "height")
    private Integer height;

    @Column(name = "width")
    private Integer width;

    @Column(name = "alt")
    private String alt;

    @Column(name = "url")
    private String url;

    @Column(name = "sequence")
    private Integer sequence;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "playback_format_id", referencedColumnName = "id")
    private PlaybackFormat playbackFormat;

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public PlaybackFormat getPlaybackFormat() { return playbackFormat; }

    public void setPlaybackFormat(PlaybackFormat playbackFormat) { this.playbackFormat = playbackFormat; }

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

    public Integer getSequence() {
        return sequence;
    }

    public void setSequence(Integer sequence) {
        this.sequence = sequence;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        Thumbnail thumbnail = (Thumbnail) o;
        return Objects.equals(this.id, thumbnail.id) &&
                Objects.equals(this.height, thumbnail.height) &&
                Objects.equals(this.width, thumbnail.width) &&
                Objects.equals(this.alt, thumbnail.alt) &&
                Objects.equals(this.url, thumbnail.url);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, height, width, alt, url);
    }

    @Override
    public int compareTo(Thumbnail t) {
        return this.getSequence().compareTo(t.getSequence());
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class Thumbnail {\n");
        sb.append("    Id: ").append(toIndentedString(id)).append("\n");
        sb.append("    height: ").append(toIndentedString(height)).append("\n");
        sb.append("    width: ").append(toIndentedString(width)).append("\n");
        sb.append("    alt: ").append(toIndentedString(alt)).append("\n");
        sb.append("    url: ").append(toIndentedString(url)).append("\n");
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