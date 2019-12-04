package org.bigbluebutton.app.screenshare.events;

public class RecordChapterBreakMessage implements IEvent {
    public final String meetingId;
    public final Long timestamp;

    public RecordChapterBreakMessage(String meetingId, Long timestamp) {
        this.meetingId = meetingId;
        this.timestamp = timestamp;
    }
}
