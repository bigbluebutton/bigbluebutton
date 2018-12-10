package org.bigbluebutton.api.messaging;

import java.util.List;
import java.util.Map;

public class NullMessagingService implements MessagingService {

    public void start() {
        // TODO Auto-generated method stub

    }

    public void stop() {
        // TODO Auto-generated method stub

    }

    @Override
    public void recordMeetingInfo(String meetingId, Map<String, String> info) {
        // TODO Auto-generated method stub

    }

    /*
     * @Override public void recordMeetingMetadata(String meetingId, Map<String,
     * String> metadata) { // TODO Auto-generated method stub
     * 
     * }
     */

    public void addListener(MessageListener listener) {
        // TODO Auto-generated method stub

    }

    public void removeListener(MessageListener listener) {
        // TODO Auto-generated method stub

    }

    public void destroyMeeting(String meetingID) {
        // TODO Auto-generated method stub

    }

    public void createMeeting(String meetingID, String externalMeetingID, String meetingName, Boolean recorded,
            String voiceBridge, Long duration) {
        // TODO Auto-generated method stub

    }

    public void sendPolls(String meetingId, String title, String question, String questionType, List<String> answers) {
        // TODO Auto-generated method stub

    }

    @Override
    public void recordBreakoutInfo(String meetingId, Map<String, String> breakoutInfo) {
        // TODO Auto-generated method stub

    }

    @Override
    public void addBreakoutRoom(String parentId, String breakoutId) {
        // TODO Auto-generated method stub

    }

}
