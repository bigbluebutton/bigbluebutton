package org.bigbluebutton.dao.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "callback_data")
@Getter
@Setter
public class CallbackData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    @XmlExport(shouldInclude = false)
    private Long id;

    @Column(name = "meeting_id")
    private String meetingId;

    @Column(name = "callback_attributes")
    private String callbackAttributes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recording_id", referencedColumnName = "id")
    @XmlExport(shouldInclude = false)
    private Recording recording;

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        CallbackData callbackData = (CallbackData) o;
        return Objects.equals(this.id, callbackData.id) &&
                Objects.equals(this.meetingId, callbackData.meetingId) &&
                Objects.equals(this.callbackAttributes, callbackData.callbackAttributes) &&
                Objects.equals(this.createdAt, callbackData.createdAt) &&
                Objects.equals(this.updatedAt, callbackData.updatedAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, meetingId, callbackAttributes, createdAt, updatedAt);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class CallbackData {\n");
        sb.append("    id: ").append(toIndentedString(id)).append("\n");
        sb.append("    meetingId: ").append(toIndentedString(meetingId)).append("\n");
        sb.append("    callbackAttributes: ").append(toIndentedString(callbackAttributes)).append("\n");
        sb.append("    createdAt: ").append(toIndentedString(createdAt)).append("\n");
        sb.append("    updatedAt: ").append(toIndentedString(updatedAt)).append("\n");
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
