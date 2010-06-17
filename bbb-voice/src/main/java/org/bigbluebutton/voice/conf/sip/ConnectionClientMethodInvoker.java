package org.bigbluebutton.voice.conf.sip;

import org.red5.app.sip.registration.SipRegisterAgentListener;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IScope;
import org.red5.server.api.service.IServiceCapableConnection;
import org.slf4j.Logger;

/**
 * Invokes methods on the client through the RTMPConnection. 
 * @author Richard Alam
 *
 */
public class ConnectionClientMethodInvoker {
	private static Logger log = Red5LoggerFactory.getLogger(ConnectionClientMethodInvoker.class, "sip");
	
	private final IServiceCapableConnection connection;
	private final int connId;
	
	public ConnectionClientMethodInvoker(int connId, IServiceCapableConnection connection, IScope scope) {
		this.connection = connection;
		this.connId = connId;
	}
	
	public int getConnId() {
		return connId;
	}
	
    public void onCallConnected(String publishName, String playName) {
    	log.debug( "SIP Call Connected" );
    	System.out.println( "SIP Call Connected" );
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
