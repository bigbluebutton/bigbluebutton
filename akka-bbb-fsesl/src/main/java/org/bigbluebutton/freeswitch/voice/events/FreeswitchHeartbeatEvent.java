package org.bigbluebutton.freeswitch.voice.events;

public class FreeswitchHeartbeatEvent extends VoiceConferenceEvent {

    public final String healthStatusJson;

    public FreeswitchHeartbeatEvent(String healthStatusJson) {
        super("unused");
        this.healthStatusJson = healthStatusJson;
    }
}
