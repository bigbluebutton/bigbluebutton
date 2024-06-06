package org.bigbluebutton.freeswitch.voice.events;

public class ConfMember {
    public final String voiceUserId;
    public final String callerIdNum;
    public final String callerIdName;
    public final Boolean muted;
    public final Boolean speaking;
    public final Boolean locked = false;
    public final String userId;
    public final String callingWith;
    public final Boolean hold;
    public final String uuid;

    public ConfMember(String userId,
                      String voiceUserId,
                      String callerIdNum,
                      String callerIdName,
                      Boolean muted,
                      Boolean speaking,
                      String callingWith,
                      Boolean hold,
                      String uuid) {
        this.userId = userId;
        this.voiceUserId = voiceUserId;
        this.callerIdName = callerIdName;
        this.callerIdNum = callerIdNum;
        this.muted = muted;
        this.speaking = speaking;
        this.callingWith = callingWith;
        this.hold = hold;
        this.uuid = uuid;
    }
}
