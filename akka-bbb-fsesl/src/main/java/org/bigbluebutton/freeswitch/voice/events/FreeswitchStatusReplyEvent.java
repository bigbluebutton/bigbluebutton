package org.bigbluebutton.freeswitch.voice.events;

public class FreeswitchStatusReplyEvent extends VoiceConferenceEvent {

    public final String jsonResponse;
    public Long sendCommandTimestamp;
    public Long receivedResponsTimestatmp;

    public FreeswitchStatusReplyEvent(Long sendCommandTimestamp,
                                      String json,
                                      Long receivedResponsTimestatmp) {
        super("unused");
        this.jsonResponse = json;
        this.sendCommandTimestamp = sendCommandTimestamp;
        this.receivedResponsTimestatmp = receivedResponsTimestatmp;
    }
}
