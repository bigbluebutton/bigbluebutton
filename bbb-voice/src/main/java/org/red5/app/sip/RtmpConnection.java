package org.red5.app.sip;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IScope;
import org.red5.server.api.service.IServiceCapableConnection;
import org.slf4j.Logger;

public class RtmpConnection implements ScopeProvider {
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
	
	public void onCallIncoming(String source, String sourceName, String destination, String destinationName) {
		connection.invoke( "incoming", 
        		new Object[] { source, sourceName, destination, destinationName } );
	}
	
	public void onUaCallRinging() {
        log.debug( "onUaCallRinging" );
        connection.invoke("callState", new Object[] {"onUaCallRinging"});
    }
	
    public void onUaCallAccepted() {
        log.debug( "onUaCallAccepted" );
        connection.invoke("callState", new Object[] {"onUaCallAccepted"});
    }

    public void onUaCallConnected(String playName, String publishName) {
    	log.debug( "SIP Call Connected" );
        connection.invoke("connected", new Object[] {playName, publishName});
    }

    public void onUaCallTrasferred() {
        log.debug( "onUaCallTrasferred");
		connection.invoke("callState", new Object[] {"onUaCallTrasferred"});
    }

    public void onUaCallCancelled() {
        log.debug( "onUaCallCancelled");
        connection.invoke("callState", new Object[] {"onUaCallCancelled"});
    }

    public void onUaCallFailed() {
        log.debug( "onUaCallFailed");
        connection.invoke("callState", new Object[] {"onUaCallFailed" });
    }

    public void onUaCallClosed() {
    	log.debug( "onUaCallClosed");
        connection.invoke("callState", new Object[] {"onUaCallClosed"});
    }

    public void onUaRegistrationSuccess(String result) {
    	log.debug( "SIP Registration success " + result );
        connection.invoke("registrationSucess", new Object[] {result});
    }

    public void onUaRegistrationFailure(String result) {
    	log.debug( "SIP Registration failure " + result );
        connection.invoke("registrationFailure", new Object[] {result});
    }

	public void onUaUnregistedSuccess() {
		// TODO Auto-generated method stub		
	}	
}
