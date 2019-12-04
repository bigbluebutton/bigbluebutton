package org.bigbluebutton.client;


public interface IClientInGW {
    void connect(ConnInfo connInfo);
    void disconnect(ConnInfo connInfo);
    void handleMsgFromClient(ConnInfo connInfo, String json);
}

