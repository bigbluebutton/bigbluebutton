package org.bigbluebutton.transcode.api;

public class TranscodingFinishedUnsuccessfully extends InternalMessage {
    private final String transcoderId;

    public TranscodingFinishedUnsuccessfully (String transcoderId) {
        this.transcoderId = transcoderId;
    }

    public String getTranscoderId() {
        return transcoderId;
    }
}
