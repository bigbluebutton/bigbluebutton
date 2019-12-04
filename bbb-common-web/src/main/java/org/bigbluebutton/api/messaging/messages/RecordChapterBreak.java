package org.bigbluebutton.api.messaging.messages;

public class RecordChapterBreak implements IMessage {
    public final String meetingId;
    public final Long timestamp;

    public RecordChapterBreak(String meetingId, Long timestamp) {
        this.meetingId = meetingId;
        this.timestamp = timestamp;
    }
}
