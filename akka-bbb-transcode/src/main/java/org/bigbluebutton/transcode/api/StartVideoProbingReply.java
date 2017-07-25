package org.bigbluebutton.transcode.api;

import java.util.Map;

public class StartVideoProbingReply extends InternalMessage {
    private final String meetingId;
    private final String transcoderId;
    private final Map<String,String> probingData;

    public StartVideoProbingReply (String meetingId, String transcoderId, Map<String,String> probingData) {
        this.meetingId = meetingId;
        this.transcoderId = transcoderId;
        this.probingData = probingData;
    }

    public String getMeetingId() {
        return meetingId;
    }

    public String getTranscoderId() {
        return transcoderId;
    }

    public Map<String,String> getProbingData(){
        return probingData;
    }
}
