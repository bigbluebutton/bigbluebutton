package org.bigbluebutton.web.services;

import org.bigbluebutton.api2.IBbbWebApiGWApp;
import org.bigbluebutton.chat.messages.SendMessageToChatFromAPI;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MessageInGroupChat {
    private static Logger log = LoggerFactory.getLogger(MessageInGroupChat.class);

    private IBbbWebApiGWApp gw;

    public void sendMessageInChatFromApi(String meetingId, String name,
                                         String message) {
        SendMessageToChatFromAPI messageInChatFromApi = new SendMessageToChatFromAPI(
                meetingId, name, message
        );
        log.debug("message ====------- {} ", gw);
        gw.sendMessageInChatFromApiMsg(messageInChatFromApi);
    }

    public void setGw(IBbbWebApiGWApp gw) {
        this.gw = gw;
    }
}
