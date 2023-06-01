package org.bigbluebutton.api.messaging.messages;

import scala.Int;

public class ModifyMeetingDuration implements IMessage {

    public final String meetingId;
    public final Integer seconds;

    public ModifyMeetingDuration(String meetingId, Integer seconds) {
        this.meetingId = meetingId;
        this.seconds = seconds;
    }
}
