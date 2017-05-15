package org.bigbluebutton.client;


public interface IClientInGW {
    void connect(ConnInfo connInfo);
    void disconnect(ConnInfo connInfo);
    void handleMessageFromClient(ConnInfo connInfo, String json);
    void send(String channel, String json);
}

