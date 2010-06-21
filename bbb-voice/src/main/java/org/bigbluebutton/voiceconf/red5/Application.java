package org.bigbluebutton.voiceconf.red5;

import java.text.MessageFormat;
import java.util.List;
import org.slf4j.Logger;
import org.bigbluebutton.voiceconf.sip.PeerNotFoundException;
import org.bigbluebutton.voiceconf.sip.SipPeerManager;
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
	private CallStreamFactory callStreamFactory;
	
    @Override
    public boolean appStart(IScope scope) {
    	log.debug("VoiceConferenceApplication appStart[" + scope.getName() + "]");
    	callStreamFactory = new CallStreamFactory();
    	callStreamFactory.setScope(scope);
    	sipPeerManager.setCallStreamFactory(callStreamFactory);
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
    public boolean appJoin(IClient client, IScope scope) {
        log.debug("VoiceConferenceApplication roomJoin[" + client.getId() + "]");
        clientConnManager.createClient(client.getId(), (IServiceCapableConnection) Red5.getConnectionLocal());
        return true;
    }

    @Override
    public void appLeave(IClient client, IScope scope) {
        log.debug("VoiceConferenceApplication roomLeave[" + client.getId() + "]");
    	clientConnManager.removeClient(client.getId());
        log.debug( "Red5SIP Client closing client {}", client.getId());

        String peerId = (String) Red5.getConnectionLocal().getAttribute("VOICE_CONF_PEER");
        if (peerId != null) {
			try {
				sipPeerManager.hangup(peerId, client.getId());
			} catch (PeerNotFoundException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        }
    }
    
    @Override
    public void streamPublishStart(IBroadcastStream stream) {
    	log.debug("streamPublishStart: {}; {}", stream, stream.getPublishedName());
    	System.out.println("streamPublishStart: " + stream.getPublishedName());
    	IConnection conn = Red5.getConnectionLocal();
    	String peerId = (String) conn.getAttribute("VOICE_CONF_PEER");
        if (peerId != null) {
        	super.streamPublishStart(stream);	    	
	    	String clientId = conn.getClient().getId();
	    	sipPeerManager.startTalkStream(peerId, clientId, stream, conn.getScope());
        }
    }
    
    @Override
    public void streamBroadcastClose(IBroadcastStream stream) {
    	System.out.println("streamBroadcastClose: " + stream.getPublishedName());
    	IConnection conn = Red5.getConnectionLocal();
    	String peerId = (String) conn.getAttribute("VOICE_CONF_PEER");
        if (peerId != null) {
        	super.streamPublishStart(stream);	    	
	    	String clientId = conn.getClient().getId();
	    	sipPeerManager.stopTalkStream(peerId, clientId, stream, conn.getScope());
	    	super.streamBroadcastClose(stream);
        }
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
	
	public void setSipPeerManager(SipPeerManager spm) {
		sipPeerManager = spm;
	}
	
	public void setClientConnectionManager(ClientConnectionManager ccm) {
		clientConnManager = ccm;
	}
}
