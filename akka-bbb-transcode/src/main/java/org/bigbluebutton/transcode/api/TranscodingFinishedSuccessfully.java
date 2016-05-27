package org.bigbluebutton.transcode.api;

public class TranscodingFinishedSuccessfully extends InternalMessage {
    private final String transcoderId;

    public TranscodingFinishedSuccessfully (String transcoderId) {
        this.transcoderId = transcoderId;
    }

    public String getTranscoderId() {
        return transcoderId;
    }
}
