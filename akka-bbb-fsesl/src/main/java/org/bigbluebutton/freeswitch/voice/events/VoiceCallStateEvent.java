package org.bigbluebutton.freeswitch.voice.events;

public class VoiceCallStateEvent extends VoiceConferenceEvent {
    public final String callSession;
    public final String clientSession;
    public final String userId;
    // AKA mod_conference memberId
    public final String voiceUserId;
    public final String callerName;
    public final String callState;
    public final String origCallerIdName;
    public final String origCalledDest;

    public VoiceCallStateEvent(
            String conf,
            String callSession,
            String clientSession,
            String userId,
            String voiceUserId,
            String callerName,
            String callState,
            String origCallerIdName,
            String origCalledDest) {
        super(conf);
        this.callSession = callSession;
        this.clientSession = clientSession;
        this.userId = userId;
        this.voiceUserId = voiceUserId;
        this.callerName = callerName;
        this.callState = callState;
        this.origCallerIdName = origCallerIdName;
        this.origCalledDest = origCalledDest;
    }

    public String getVoiceUserId() {
        return voiceUserId;
    }
}
