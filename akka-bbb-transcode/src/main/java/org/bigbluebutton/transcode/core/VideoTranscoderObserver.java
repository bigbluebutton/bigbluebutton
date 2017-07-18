package org.bigbluebutton.transcode.core;

import java.util.Map;

public interface VideoTranscoderObserver {
    public void handleTranscodingFinishedUnsuccessfully();
    public void handleTranscodingFinishedWithSuccess();
    public void handleVideoProbingFinishedWithSuccess(Map<String,String> ffprobeResult);
}
