package org.bigbluebutton.freeswitch.voice.events;

import java.util.Map;

public class FreeswitchHeartbeatEvent extends VoiceConferenceEvent {

    public final Map<String, String> heartbeat;

    public FreeswitchHeartbeatEvent(Map<String, String> heartbeat) {
        super("unused");
        this.heartbeat = heartbeat;
    }
}
