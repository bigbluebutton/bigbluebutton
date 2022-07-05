package org.bigbluebutton.dao.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "recording")
@Getter
@Setter
public class Recording {

    public enum State {
        PROCESSING("processing"),
        PROCESSED("processed"),
        PUBLISHING("publishing"),
        PUBLISHED("published"),
        UNPUBLISHING("unpublishing"),
        UNPUBLISHED("unpublished"),
        DELETING("deleting"),
        DELETED("deleted");

        private String value;

        State(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    @XmlExport(shouldInclude = false)
    private Long id;

    @Column(name = "record_id")
    @XmlExport(name = "id")
    private String recordId;

    @Column(name = "meeting_id")
    @XmlExport(name = "externalId")
    private String meetingId;

    @Column(name = "name")
    private String name;

    @Column(name = "published")
    private Boolean published;

    @Column(name = "participants")
    private Integer participants;

    @Column(name = "state")
    private String state;

    @Column(name = "start_time")
    @XmlExport(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    @XmlExport(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "deleted_at")
    @XmlExport(name = "deletedAt")
    private LocalDateTime deletedAt;

    @Column(name = "publish_updated")
    @XmlExport(name = "deleted_at")
    private Boolean publishUpdated;

    @Column(name = "protected")
    @XmlExport(name = "protected")
    private Boolean isProtected;

    @OneToMany(mappedBy = "recording", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @XmlExport(shouldInclude = false)
    private Set<Metadata> metadata;

    @OneToOne(mappedBy = "recording", cascade = CascadeType.ALL)
    @XmlExport(shouldInclude = false)
    private PlaybackFormat format;

    @OneToOne(mappedBy = "recording", cascade = CascadeType.ALL)
    @XmlExport(shouldInclude = false)
    private CallbackData callbackData;

    @OneToMany(mappedBy = "recording", cascade = CascadeType.ALL)
    @XmlExport(shouldInclude = false)
    private Set<Track> tracks;

    @OneToOne(mappedBy = "recording", cascade = CascadeType.ALL)
    @XmlExport(shouldInclude = false)
    private Events events;

    public void addMetadata(Metadata metadata) {
        if(this.metadata == null) this.metadata = new HashSet<>();
        metadata.setRecording(this);
        this.metadata.add(metadata);
    }

    public void addTrack(Track track) {
        if(tracks == null) tracks = new HashSet<>();
        track.setRecording(this);
        tracks.add(track);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        Recording recording = (Recording) o;
        return Objects.equals(this.id, recording.id) &&
                Objects.equals(this.recordId, recording.recordId) &&
                Objects.equals(this.meetingId, recording.meetingId) &&
                Objects.equals(this.name, recording.name) &&
                Objects.equals(this.published, recording.published) &&
                Objects.equals(this.participants, recording.participants) &&
                Objects.equals(this.state, recording.state) &&
                Objects.equals(this.startTime, recording.startTime) &&
                Objects.equals(this.endTime, recording.endTime) &&
                Objects.equals(this.deletedAt, recording.deletedAt) &&
                Objects.equals(this.publishUpdated, recording.publishUpdated) &&
                Objects.equals(this.isProtected, recording.isProtected) &&
                Objects.equals(this.metadata, recording.metadata) &&
                Objects.equals(this.format, recording.format) &&
                Objects.equals(this.callbackData, recording.callbackData);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, recordId, meetingId, name, published, participants, state, startTime, endTime,
                deletedAt, publishUpdated, isProtected, metadata, format, callbackData);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class Recording {\n");
        sb.append("    id: ").append(toIndentedString(id)).append("\n");
        sb.append("    recordId: ").append(toIndentedString(recordId)).append("\n");
        sb.append("    meetingId: ").append(toIndentedString(meetingId)).append("\n");
        sb.append("    name: ").append(toIndentedString(name)).append("\n");
        sb.append("    published: ").append(toIndentedString(published)).append("\n");
        sb.append("    participants: ").append(toIndentedString(participants)).append("\n");
        sb.append("    state: ").append(toIndentedString(state)).append("\n");
        sb.append("    startTime: ").append(toIndentedString(startTime)).append("\n");
        sb.append("    endTime: ").append(toIndentedString(endTime)).append("\n");
        sb.append("    deletedAt: ").append(toIndentedString(deletedAt)).append("\n");
        sb.append("    publishUpdated: ").append(toIndentedString(publishUpdated)).append("\n");
        sb.append("    protected: ").append(toIndentedString(isProtected)).append("\n");
        sb.append("    metadata: ").append(toIndentedString(metadata)).append("\n");
        sb.append("    format: ").append(toIndentedString(format)).append("\n");
        sb.append("    callBackData: ").append(toIndentedString(callbackData)).append("\n");
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
