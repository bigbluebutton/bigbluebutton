package org.bigbluebutton.freeswitch.voice.events;

import java.util.List;

public class FreeswitchStatusReplyEvent extends VoiceConferenceEvent {

    public final List<String> status;
    public Long sendCommandTimestamp;
    public Long receivedResponsTimestatmp;

    public FreeswitchStatusReplyEvent(Long sendCommandTimestamp,
                                      List<String> status,
                                      Long receivedResponsTimestatmp) {
        super("unused");
        this.status = status;
        this.sendCommandTimestamp = sendCommandTimestamp;
        this.receivedResponsTimestatmp = receivedResponsTimestatmp;
    }
}
