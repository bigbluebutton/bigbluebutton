package org.bigbluebutton.app.video;

import java.util.HashMap;
import java.util.Map;

public class MeetingManager {

    private VideoApplication app;

    private Map<String, Meeting> meetings = new HashMap<String, Meeting>();

    public MeetingManager(VideoApplication app) {
        this.app = app;
    }

    public void add(String id) {
        Meeting m = new Meeting(id);
        meetings.put(m.id, m);
    }

    public void remove(String id) {
        Meeting m = meetings.remove(id);
        if (m != null) {
            // Close all streams;
        }
    }

}

