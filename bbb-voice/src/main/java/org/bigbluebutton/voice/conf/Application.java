package org.bigbluebutton.voice.conf;

import java.text.MessageFormat;
import java.util.List;
import org.slf4j.Logger;
import org.bigbluebutton.voice.conf.sip.ClientConnectionManager;
import org.bigbluebutton.voice.conf.sip.SipPeerManager;
import org.bigbluebutton.voice.conf.sip.exception.PeerNotFoundException;
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
    
    private String sipServerHost = "localhost";
    private int startSipPort = 5070;
    private int stopSipPort = 5099;
    private int sipPort;
    private int startRtpPort = 3000;
	private int stopRtpPort = 3029;
	private int rtpPort;
	private String password = "secret";
	private String username;
	
	private MessageFormat callExtensionPattern = new MessageFormat("{0}");
    
    @Override
    public boolean appStart(IScope scope) {
    	log.debug("VoiceConferenceApplication appStart[" + scope.getName() + "]");   	
        sipPeerManager.setClientConnectionManager(clientConnManager);
        sipPeerManager.createSipPeer(sipServerHost, sipServerHost, startSipPort, startRtpPort, stopRtpPort);
        try {
			sipPeerManager.register(sipServerHost, username, password);
		} catch (PeerNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
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
        log.debug( "Red5SIP Client closing client {}", client.getId());
        // TODO: Need to hangup disconnected client..but we don't have the peerid????
//        sipPeerManager.hangup(client.getId());
    }
    
    @Override
    public void streamPublishStart(IBroadcastStream stream) {
    	log.debug("streamPublishStart: {}; {}", stream, stream.getPublishedName());
    	System.out.println("streamPublishStart: " + stream.getPublishedName());
    	super.streamPublishStart(stream);
    	IConnection conn = Red5.getConnectionLocal();
    	String userid = conn.getClient().getId();
 //   	sipPeerManager.startTalkStream(userid, stream, Red5.getConnectionLocal().getScope());
    }
    
    @Override
    public void streamBroadcastClose(IBroadcastStream stream) {
    	System.out.println("streamBroadcastClose: " + stream.getPublishedName());
    	IConnection conn = Red5.getConnectionLocal();
    	String userid = conn.getClient().getId();
//    	sipPeerManager.stopTalkStream(userid, stream, Red5.getConnectionLocal().getScope());
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
    
    public void setUsername(String un) {
    	this.username = un;
    }
    
    public void setPassword(String pw) {
    	this.password = pw;
    }
    
    public void setStartSIPPort(int startSIPPort) {
		this.startSipPort = startSIPPort;
	}

	public void setStopSIPPort(int stopSIPPort) {
		this.stopSipPort = stopSIPPort;
	}

	public void setStartRTPPort(int startRTPPort) {
		this.startRtpPort = startRTPPort;
	}

	public void setStopRTPPort(int stopRTPPort) {
		this.stopRtpPort = stopRTPPort;
	}
	
	public void setCallExtensionPattern(String callExtensionPattern) {
		this.callExtensionPattern = new MessageFormat(callExtensionPattern);
	}
	
	public void setSipPeerManager(SipPeerManager spm) {
		sipPeerManager = spm;
	}
	
	public void setClientConnectionManager(ClientConnectionManager ccm) {
		clientConnManager = ccm;
	}
}
