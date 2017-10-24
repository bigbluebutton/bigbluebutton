package org.bigbluebutton.app.video;

import java.util.HashMap;
import java.util.Map;

public class Meeting {
    public final String id;

    private Map<String, VideoStream> videoStreams = new HashMap<String, VideoStream>();

    public Meeting(String id) {
        this.id = id;
    }

    public synchronized void addStream(VideoStream stream) {
        videoStreams.put(stream.getStreamId(), stream);
    }

    public synchronized void removeStream(String streamId) {
        VideoStream vs = videoStreams.remove(streamId);
    }

    public synchronized void streamBroadcastClose(String streamId) {
        VideoStream vs = videoStreams.remove(streamId);
        if (vs != null) {
            vs.streamBroadcastClose();
        }
    }

    public synchronized boolean hasVideoStreams() {
        return !videoStreams.isEmpty();
    }

    public synchronized void stopStartRecording(String streamId) {
        VideoStream vs = videoStreams.get(streamId);
        if (vs != null) vs.stopStartRecording();
    }

    public synchronized void stopStartAllRecordings() {
        for (VideoStream vs : videoStreams.values()) {
            stopStartRecording(vs.getStreamId());
        }
    }
}
