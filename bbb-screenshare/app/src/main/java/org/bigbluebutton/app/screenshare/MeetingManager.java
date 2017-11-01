package org.bigbluebutton.app.screenshare;

import java.util.HashMap;
import java.util.Map;

public class MeetingManager {

    private Map<String, Meeting> meetings = new HashMap<String, Meeting>();

    private void add(Meeting m) {
        meetings.put(m.id, m);
    }

    private void remove(String id) {
        Meeting m = meetings.remove(id);
    }

    public void addStream(String meetingId, VideoStream vs) {
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
        Meeting m = meetings.get(meetingId);
        if (m != null) {
            m.removeStream(streamId);
        }
    }

    public void streamBroadcastClose(String meetingId, String streamId) {
        Meeting m = meetings.get(meetingId);
        if (m != null) {
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

