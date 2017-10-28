package org.bigbluebutton.red5.pubsub.message;

public class RecordChapterBreakMessage {
    public final String meetingId;
    public final Long timestamp;

    public RecordChapterBreakMessage(String meetingId, Long timestamp) {
        this.meetingId = meetingId;
        this.timestamp = timestamp;
    }
}
