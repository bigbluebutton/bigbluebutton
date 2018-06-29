package org.bigbluebutton.app.screenshare;

import java.util.HashMap;
import java.util.Map;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class Meeting {
    private static Logger log = Red5LoggerFactory.getLogger(Meeting.class, "screenshare");

    public final String id;

    private Map<String, VideoStream> videoStreams = new HashMap<String, VideoStream>();

    public Meeting(String id) {
        this.id = id;
    }

    public synchronized void addStream(VideoStream stream) {
			log.debug("Adding VideoStream {} to meeting {}", stream.getStreamId(), id);
			videoStreams.put(stream.getStreamId(), stream);
    }

    public synchronized void removeStream(String streamId) {
			log.debug("Removing VideoStream {} to meeting {}", streamId, id);
			VideoStream vs = videoStreams.remove(streamId);
    }

    public synchronized void streamBroadcastClose(String streamId) {
			log.debug("streamBroadcastClose VideoStream {} to meeting {}", streamId, id);
			VideoStream vs = videoStreams.remove(streamId);
        if (vs != null) {
					log.debug("Closing VideoStream {} to meeting {}", streamId, id);
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
