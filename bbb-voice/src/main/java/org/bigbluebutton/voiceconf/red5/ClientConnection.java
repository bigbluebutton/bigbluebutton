package org.bigbluebutton.voiceconf.red5;

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
	
    public void onJoinConferenceSuccess(String publishName, String playName) {
    	log.debug( "SIP Call Connected" );
        connection.invoke("successfullyJoinedVoiceConferenceCallback", new Object[] {publishName, playName});
    }

    public void onJoinConferenceFail() {
        log.debug("onOutgoingCallFailed");
        connection.invoke("failedToJoinVoiceConferenceCallback", new Object[] {"onUaCallFailed"});
    }

    public void onLeaveConference() {
    	log.debug("onCallClosed");
        connection.invoke("disconnectedFromJoinVoiceConferenceCallback", new Object[] {"onUaCallClosed"});
    }
}
