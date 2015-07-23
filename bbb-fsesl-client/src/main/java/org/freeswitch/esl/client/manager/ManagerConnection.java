package org.freeswitch.esl.client.manager;

import org.freeswitch.esl.client.inbound.Client;
import org.freeswitch.esl.client.inbound.InboundConnectionFailure;

public interface ManagerConnection
{
    String getHostname();
    int getPort();
    String getPassword();
    Client getESLClient();
    void connect() throws InboundConnectionFailure;
    void disconnect();
}
