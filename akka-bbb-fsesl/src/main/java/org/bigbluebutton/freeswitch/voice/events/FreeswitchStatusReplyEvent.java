package org.bigbluebutton.freeswitch.voice.events;

public class FreeswitchStatusReplyEvent extends VoiceConferenceEvent {

    public final String jsonResponse;

    public FreeswitchStatusReplyEvent(String json) {
        super("unused");
        this.jsonResponse = json;
    }
}
