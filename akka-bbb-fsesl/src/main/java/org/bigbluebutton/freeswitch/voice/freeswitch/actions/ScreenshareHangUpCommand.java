package org.bigbluebutton.freeswitch.voice.freeswitch.actions;

import org.bigbluebutton.freeswitch.voice.events.ConferenceEventListener;
import org.freeswitch.esl.client.transport.message.EslMessage;

/**
 * Created by anton on 07/01/16.
 */
public class ScreenshareHangUpCommand extends FreeswitchCommand {
    private String timestamp;
    private String fsConferenceName;
    private final String SCREENSHARE_SUFFIX = "-SCREENSHARE";

    public ScreenshareHangUpCommand(String room, String fsConferenceName, String requesterId, String timestamp){
        super(room, requesterId);
        this.timestamp = timestamp;
        this.fsConferenceName = fsConferenceName;
    }


    @Override
    public String getCommandArgs() {
        String action = "kick all";

        if(!fsConferenceName.endsWith(SCREENSHARE_SUFFIX)) {
            fsConferenceName = fsConferenceName + SCREENSHARE_SUFFIX;
        }
        return SPACE + fsConferenceName + SPACE + action;
    }

    public void handleResponse(EslMessage response, ConferenceEventListener eventListener) {
    }
}

