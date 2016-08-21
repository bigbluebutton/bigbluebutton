package org.bigbluebutton.transcode.core.api;

import java.util.Map;


public interface ITranscodingInGW {
    void startTranscoder(String meetingId, String transcoderId, Map<String, String> params);
    void updateTranscoder(String meetingId, String transcoderId, Map<String, String> params);
    void stopTranscoder(String meetingId, String transcoderId);
    void stopMeetingTranscoders(String meetingId);
    void startProbing(String meetingId, String transcoderId, Map<String, String> params);
}
