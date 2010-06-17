package org.bigbluebutton.voice.conf;

import java.text.MessageFormat;
import java.util.List;
import org.slf4j.Logger;
import org.bigbluebutton.voice.conf.sip.ClientConnectionManager;
import org.bigbluebutton.voice.conf.sip.SipPeerManager;
import org.red5.app.sip.SipUserManager;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.adapter.MultiThreadedApplicationAdapter;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.red5.server.api.Red5;
import org.red5.server.api.service.IServiceCapableConnection;
import org.red5.server.api.stream.IBroadcastStream;

public class Application extends MultiThreadedApplicationAdapter {
    private static Logger log = Red5LoggerFactory.getLogger(Application.class, "sip");

    private SipPeerManager sipPeerManager;
    private ClientConnectionManager clientConnManager;
    
    private String sipServerHost;
    private int startSIPPort = 5070;
    private int stopSIPPort = 5099;
    private int sipPort;
    private int startRTPPort = 3000;
	private int stopRTPPort = 3029;
	private int rtpPort;
	private String password = "secret";
	
	private MessageFormat callExtensionPattern = new MessageFormat("{0}");
    
    @Override
    public boolean appStart(IScope scope) {
    	log.debug("VoiceConferenceApplication appStart[" + scope.getName() + "]");
        sipPort = startSIPPort;
        rtpPort = startRTPPort;
        sipPeerManager.setClientConnectionManager(clientConnManager);
        return true;
    }

    @Override
    public void appStop(IScope scope) {
        log.debug("VoiceConferenceApplication appStop[" + scope.getName() + "]");
        sipPeerManager.destroyAllSessions();
    }

    @Override
    public boolean roomJoin(IClient client, IScope scope) {
        log.debug("VoiceConferenceApplication appJoin[" + client.getId() + "]");
        clientConnManager.createClient(client.getId(), (IServiceCapableConnection) Red5.getConnectionLocal());
        return true;
    }

    @Override
    public void roomLeave(IClient client, IScope scope) {
        log.debug("VoiceConferenceApplication appLeave[" + client.getId() + "]");
    	clientConnManager.removeClient(client.getId());
        log.debug( "Red5SIP Client closing client " +userid );
        sipPeerManager.close(userid);
    }
    
    @Override
    public void streamPublishStart(IBroadcastStream stream) {
    	log.debug("streamPublishStart: {}; {}", stream, stream.getPublishedName());
    	System.out.println("streamPublishStart: " + stream.getPublishedName());
    	super.streamPublishStart(stream);
    	IConnection conn = Red5.getConnectionLocal();
    	String userid = conn.getClient().getId();
    	sipPeerManager.startTalkStream(userid, stream, Red5.getConnectionLocal().getScope());
    }
    
    @Override
    public void streamBroadcastClose(IBroadcastStream stream) {
    	System.out.println("streamBroadcastClose: " + stream.getPublishedName());
    	IConnection conn = Red5.getConnectionLocal();
    	String userid = conn.getClient().getId();
    	sipPeerManager.stopTalkStream(userid, stream, Red5.getConnectionLocal().getScope());
    	super.streamBroadcastClose(stream);
    }
    
    public List<String> getStreams() {
        IConnection conn = Red5.getConnectionLocal();
        return getBroadcastStreamNames( conn.getScope() );
    }

    public void onPing() {
    	log.debug( "Red5SIP Ping" );
    }
		
    public void setSipServerHost(String h) {
    	sipServerHost = h;
    }
    
    public void setStartSIPPort(int startSIPPort) {
		this.startSIPPort = startSIPPort;
	}

	public void setStopSIPPort(int stopSIPPort) {
		this.stopSIPPort = stopSIPPort;
	}

	public void setStartRTPPort(int startRTPPort) {
		this.startRTPPort = startRTPPort;
	}

	public void setStopRTPPort(int stopRTPPort) {
		this.stopRTPPort = stopRTPPort;
	}
	
	public void setCallExtensionPattern(String callExtensionPattern) {
		this.callExtensionPattern = new MessageFormat(callExtensionPattern);
	}
	
	public void setSipPeerManager(SipPeerManager sum) {
		sipPeerManager = sum;
	}
	
	public void setClientConnectionManager(ClientConnectionManager ccm) {
		clientConnManager = ccm;
	}
}
