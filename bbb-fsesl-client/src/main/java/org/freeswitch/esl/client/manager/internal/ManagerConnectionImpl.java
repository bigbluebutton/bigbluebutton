package org.freeswitch.esl.client.manager.internal;

import java.util.logging.Level;
import java.util.logging.Logger;
import org.freeswitch.esl.client.inbound.Client;
import org.freeswitch.esl.client.inbound.InboundConnectionFailure;
import org.freeswitch.esl.client.manager.ManagerConnection;

public class ManagerConnectionImpl implements ManagerConnection
{
    private static final String DEFAULT_HOSTNAME = "localhost";
    private static final int DEFAULT_PORT = 8021;
    private static final int DEFAULT_TIMEOUT = 2;
    
    private Client esl_client;
    private String hostname = DEFAULT_HOSTNAME;
    private int port = DEFAULT_PORT;
    private int timeoutSeconds = DEFAULT_TIMEOUT;
    protected String password;

    public ManagerConnectionImpl() {
        esl_client = new Client();
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    public void setPort(int port) {
        if (port <= 0) {
            this.port = DEFAULT_PORT;
        } else {
            this.port = port;
        }
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setTimeout(int timeout) {
        this.timeoutSeconds = timeout;
    }

    public String getHostname() {
        return hostname;
    }

    public int getPort() {
        return port;
    }

    public String getPassword() {
        return password;
    }

    public Client getESLClient() {
        return esl_client;
    }

    public void connect() throws InboundConnectionFailure {
        esl_client.connect(hostname, port, password, timeoutSeconds);
        esl_client.setEventSubscriptions( "plain", "all" );
        esl_client.addEventFilter( "Event-Name", "heartbeat" );
        esl_client.addEventFilter( "Event-Name", "custom" );
        esl_client.addEventFilter( "Event-Name", "background_job" );
        
        try {
            Thread.sleep(5000);
        } catch (InterruptedException ex) {
            Logger.getLogger(ManagerConnectionImpl.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public void disconnect() {
        esl_client.close();
    }
}
