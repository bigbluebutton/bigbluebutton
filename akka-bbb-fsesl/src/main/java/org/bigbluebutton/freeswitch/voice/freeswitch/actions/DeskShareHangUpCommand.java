package org.bigbluebutton.freeswitch.voice.freeswitch.actions;

import org.bigbluebutton.freeswitch.voice.events.ConferenceEventListener;
import org.freeswitch.esl.client.transport.message.EslMessage;

/**
 * Created by anton on 07/01/16.
 */
public class DeskShareHangUpCommand  extends FreeswitchCommand {
    private String timestamp;
    private String fsConferenceName;

    public DeskShareHangUpCommand(String room, String fsConferenceName, String requesterId, String timestamp){
        super(room, requesterId);
        this.timestamp = timestamp;
        this.fsConferenceName = fsConferenceName;
    }


    @Override
    public String getCommandArgs() {
        String action = "kick all";

        return SPACE + fsConferenceName + SPACE + action;
    }

    public void handleResponse(EslMessage response, ConferenceEventListener eventListener) {
        System.out.println("\nDeskShareHangUpCommand\n");
    }
}

