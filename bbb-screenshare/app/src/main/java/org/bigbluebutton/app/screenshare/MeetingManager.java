package org.bigbluebutton.app.screenshare;

import java.util.HashMap;
import java.util.Map;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class MeetingManager {
    private static Logger log = Red5LoggerFactory.getLogger(MeetingManager.class, "screenshare");

    private Map<String, Meeting> meetings = new HashMap<String, Meeting>();

    private void add(Meeting m) {
        meetings.put(m.id, m);
    }

    private void remove(String id) {
        Meeting m = meetings.remove(id);
    }

    public void addStream(String meetingId, VideoStream vs) {
        log.debug("Adding VideoStream {} to meeting {}", vs.getStreamId(), meetingId);

        Meeting m = meetings.get(meetingId);
        if (m != null) {
            m.addStream(vs);
        } else {
            Meeting nm = new Meeting(meetingId);
            nm.addStream(vs);
            add(nm);
        }
    }

    public void removeStream(String meetingId, String streamId) {
			log.debug("Removing VideoStream {} to meeting {}", streamId, meetingId);
        Meeting m = meetings.get(meetingId);
        if (m != null) {
					log.debug("Removed VideoStream {} to meeting {}", streamId, meetingId);
            m.removeStream(streamId);
        }
    }

    public void streamBroadcastClose(String meetingId, String streamId) {
			log.debug("streamBroadcastClose VideoStream {} to meeting {}", streamId, meetingId);

			Meeting m = meetings.get(meetingId);
        if (m != null) {
					log.debug("streamBroadcastClose 2 VideoStream {} to meeting {}", streamId, meetingId);

					m.streamBroadcastClose(streamId);
            if (!m.hasVideoStreams()) {
                remove(m.id);
            }
        }
    }

    public synchronized void stopStartAllRecordings(String meetingId) {
        Meeting m = meetings.get(meetingId);
        if (m != null) {
            m.stopStartAllRecordings();
        }
    }
}

