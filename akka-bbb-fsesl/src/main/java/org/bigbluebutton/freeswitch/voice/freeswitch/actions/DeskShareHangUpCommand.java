package org.bigbluebutton.freeswitch.voice.freeswitch.actions;

import org.bigbluebutton.freeswitch.voice.events.ConferenceEventListener;
import org.freeswitch.esl.client.transport.message.EslMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DeskShareHangUpCommand  extends FreeswitchCommand {
    private String timestamp;
    private String fsConferenceName;
    private final String DESKSHARE_SUFFIX = "-DESKSHARE";
    private static final Logger log = LoggerFactory.getLogger(DeskShareHangUpCommand.class);

    public DeskShareHangUpCommand(String room, String fsConferenceName, String requesterId, String timestamp){
        super(room, requesterId);
        this.timestamp = timestamp;
        this.fsConferenceName = fsConferenceName;
    }


    @Override
    public String getCommandArgs() {
        String action = "kick all";

        if(!fsConferenceName.endsWith(DESKSHARE_SUFFIX)) {
            fsConferenceName = fsConferenceName + DESKSHARE_SUFFIX;
        }
        return SPACE + fsConferenceName + SPACE + action;
    }

    public void handleResponse(EslMessage response, ConferenceEventListener eventListener) {
        log.info("DeskShareHangUpCommand");
    }
}

