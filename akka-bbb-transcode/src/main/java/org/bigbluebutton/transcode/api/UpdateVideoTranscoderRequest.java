package org.bigbluebutton.transcode.api;

import java.util.Map;

public class UpdateVideoTranscoderRequest extends InternalMessage {
    private final Map<String,String> params;

    public UpdateVideoTranscoderRequest(Map<String,String> params) {
        this.params = params;
    }

    public Map<String,String> getParams() {
        return params;
    }
}
