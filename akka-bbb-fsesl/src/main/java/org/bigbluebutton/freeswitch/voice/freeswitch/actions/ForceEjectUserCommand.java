package org.bigbluebutton.freeswitch.voice.freeswitch.actions;

import com.google.gson.Gson;
import org.bigbluebutton.freeswitch.voice.events.ConferenceEventListener;
import org.freeswitch.esl.client.transport.message.EslMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ForceEjectUserCommand extends FreeswitchCommand {
    private static Logger log = LoggerFactory.getLogger(ForceEjectUserCommand.class);

    private final String voiceConf;
    private final String userId;
    private final String uuid;

    public ForceEjectUserCommand(String voiceConf, String userId, String uuid) {
        super(voiceConf, userId);
        this.voiceConf = voiceConf;
        this.userId = userId;
        this.uuid = uuid;
    }
    @Override
    public String getCommand() {
        return "uuid_kill " + uuid;
    }

    @Override
    public String getCommandArgs() {
        log.debug("Force eject user " + userId + " from conf " + voiceConf + " by uuid_kill " + uuid);
        return "";
    }

    public void handleResponse(EslMessage response, ConferenceEventListener eventListener) {
        Gson gson = new Gson();
        log.info(gson.toJson(response.getBodyLines()));

    }
}
