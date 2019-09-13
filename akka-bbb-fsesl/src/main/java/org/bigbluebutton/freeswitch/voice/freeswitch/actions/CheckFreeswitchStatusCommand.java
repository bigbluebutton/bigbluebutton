package org.bigbluebutton.freeswitch.voice.freeswitch.actions;

import com.google.gson.Gson;
import org.apache.commons.lang3.StringUtils;
import org.bigbluebutton.freeswitch.voice.events.ConferenceEventListener;
import org.freeswitch.esl.client.transport.message.EslMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CheckFreeswitchStatusCommand extends FreeswitchCommand {
    private static Logger log = LoggerFactory.getLogger(CheckFreeswitchStatusCommand.class);

    public CheckFreeswitchStatusCommand(String room, String requesterId) {
        super(room, requesterId);
    }

    @Override
    public String getCommand() {
        return "status";
    }

    @Override
    public String getCommandArgs() {
        log.debug("Check FreeSWITCH Status.");
        return "";
    }

    public void handleResponse(EslMessage response, ConferenceEventListener eventListener) {

        Gson gson = new Gson();
        log.info(gson.toJson(response.getBodyLines()));

    }

}
