package org.bigbluebutton.common2.redis.pubsub;

import java.util.Set;

public class MessageDistributor {
    private ReceivedMessageHandler handler;
    private Set<MessageHandler> listeners;

    public void setMessageListeners(Set<MessageHandler> listeners) {
        this.listeners = listeners;
    }

    public void setMessageHandler(ReceivedMessageHandler handler) {
        this.handler = handler;
        if (handler != null) {
            handler.setMessageDistributor(this);
        }
    }

    public void notifyListeners(String pattern, String channel, String message) {
        for (MessageHandler listener : listeners) {
            listener.handleMessage(pattern, channel, message);
        }
    }
}
