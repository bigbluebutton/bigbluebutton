package org.bigbluebutton.voice.conf.sip;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.service.IServiceCapableConnection;
import org.slf4j.Logger;

public class ClientConnection {
private static Logger log = Red5LoggerFactory.getLogger(ClientConnection.class, "sip");
	
	private final IServiceCapableConnection connection;
	private final String connId;
	
	public ClientConnection(String connId, IServiceCapableConnection connection) {
		this.connection = connection;
		this.connId = connId;
	}
	
	public String getConnId() {
		return connId;
	}
	
    public void onCallConnected(String publishName, String playName) {
    	log.debug( "SIP Call Connected" );
        connection.invoke("connected", new Object[] {publishName, playName});
    }

    public void onOutgoingCallFailed() {
        log.debug("onOutgoingCallFailed");
        connection.invoke("callState", new Object[] {"onUaCallFailed"});
    }

    public void onCallClosed() {
    	log.debug("onCallClosed");
        connection.invoke("callState", new Object[] {"onUaCallClosed"});
    }
}
