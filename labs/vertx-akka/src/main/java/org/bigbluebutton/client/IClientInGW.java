package org.bigbluebutton.client;


import org.bigbluebutton.client.bus.ConnInfo2;

public interface IClientInGW {
    void connect(ConnInfo2 connInfo);
    void disconnect(ConnInfo2 connInfo);
    void handleMsgFromClient(ConnInfo2 connInfo, String json);
    void send(String channel, String json);
}

