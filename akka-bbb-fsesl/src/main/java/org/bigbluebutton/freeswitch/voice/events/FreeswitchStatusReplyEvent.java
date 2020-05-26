package org.bigbluebutton.freeswitch.voice.events;

import java.util.List;

public class FreeswitchStatusReplyEvent extends VoiceConferenceEvent {

    public final List<String> status;
    public Long sendCommandTimestamp;
    public Long receivedResponseTimestamp;

    public FreeswitchStatusReplyEvent(Long sendCommandTimestamp,
                                      List<String> status,
                                      Long receivedResponseTimestamp) {
        super("unused");
        this.status = status;
        this.sendCommandTimestamp = sendCommandTimestamp;
        this.receivedResponseTimestamp = receivedResponseTimestamp;
    }
}
