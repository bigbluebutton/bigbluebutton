package org.bigbluebutton.api;

import org.bigbluebutton.api.messaging.messages.IMessage;

public interface IReceivedOldMessageHandler {
    void handleMessage(IMessage msg);
}
