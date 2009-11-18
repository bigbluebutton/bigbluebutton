package org.red5.app.sip;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IScope;
import org.red5.server.api.service.IServiceCapableConnection;
import org.slf4j.Logger;

public class RtmpConnection implements ScopeProvider, SipUserAgentListener, SipRegisterAgentListener {
	private static Logger log = Red5LoggerFactory.getLogger( RtmpConnection.class, "sip" );
	
	private final IServiceCapableConnection connection;
	private final IScope scope;
	
	public RtmpConnection(IServiceCapableConnection connection, IScope scope) {
		this.connection = connection;
		this.scope = scope;
	}
	
	public IScope getScope() {
		return scope;
	}
	
	public void onNewIncomingCall(String source, String sourceName, String destination, String destinationName) {
		connection.invoke("incoming", new Object[] {source, sourceName, destination, destinationName});
	}
	
	public void onOutgoingCallRemoteRinging() {
        log.debug("onOutgoingCallRemoteRinging");
        connection.invoke("callState", new Object[] {"onUaCallRinging"});
    }
	
    public void onOutgoingCallAccepted() {
        log.debug("onOutgoingCallAccepted");
        connection.invoke("callState", new Object[] {"onUaCallAccepted"});
    }

    public void onCallConnected(String playName, String publishName) {
    	log.debug( "SIP Call Connected" );
        connection.invoke("connected", new Object[] {playName, publishName});
    }

    public void onCallTrasferred() {
        log.debug("onCallTrasferred");
		connection.invoke("callState", new Object[] {"onUaCallTrasferred"});
    }

    public void onIncomingCallCancelled() {
        log.debug("onIncomingCallCancelled");
        connection.invoke("callState", new Object[] {"onUaCallCancelled"});
    }

    public void onOutgoingCallFailed() {
        log.debug("onOutgoingCallFailed");
        connection.invoke("callState", new Object[] {"onUaCallFailed"});
    }

    public void onCallClosed() {
    	log.debug("onCallClosed");
        connection.invoke("callState", new Object[] {"onUaCallClosed"});
    }

    public void onRegistrationSuccess(String result) {
    	log.debug( "SIP Registration success " + result );
        connection.invoke("registrationSucess", new Object[] {result});
    }

    public void onRegistrationFailure(String result) {
    	log.debug( "SIP Registration failure " + result );
        connection.invoke("registrationFailure", new Object[] {result});
    }

	public void onUnregistedSuccess() {
		// TODO Auto-generated method stub		
	}	
}
