/** 
*
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
**/
package org.bigbluebutton.voiceconf.red5;

import java.util.List;
import org.slf4j.Logger;
import org.bigbluebutton.voiceconf.sip.PeerNotFoundException;
import org.bigbluebutton.voiceconf.sip.SipPeerManager;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.adapter.MultiThreadedApplicationAdapter;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.red5.server.api.Red5;
import org.red5.server.api.service.IServiceCapableConnection;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.stream.ClientBroadcastStream;

public class Application extends MultiThreadedApplicationAdapter {
    private static Logger log = Red5LoggerFactory.getLogger(Application.class, "sip");

    private SipPeerManager sipPeerManager;
    private ClientConnectionManager clientConnManager;
    
    private String sipServerHost = "localhost";
    private int sipPort = 5070;
    private int startAudioPort = 3000;
	private int stopAudioPort = 3029;
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
        sipPeerManager.createSipPeer("default", sipServerHost, sipPort, startAudioPort, stopAudioPort);
        try {
			sipPeerManager.register("default", username, password);
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
    public boolean appConnect(IConnection conn, Object[] params) {
    	String userid = ((String) params[0]).toString();
        String username = ((String) params[1]).toString();
        String clientId = Red5.getConnectionLocal().getClient().getId();
        String remoteHost = Red5.getConnectionLocal().getRemoteAddress();
        int remotePort = Red5.getConnectionLocal().getRemotePort();
        
        if ((userid == null) || ("".equals(userid))) userid = "unknown-userid";
        if ((username == null) || ("".equals(username))) username = "UNKNOWN-CALLER";
        Red5.getConnectionLocal().setAttribute("USERID", userid);
        Red5.getConnectionLocal().setAttribute("USERNAME", username);
        
        log.info("{} [clientid={}] has connected to the voice conf app.", username + "[uid=" + userid + "]", clientId);
        log.info("[clientid={}] connected from {}.", clientId, remoteHost + ":" + remotePort);
        
        clientConnManager.createClient(clientId, userid, username, (IServiceCapableConnection) Red5.getConnectionLocal());
        return true;
    }

    @Override
    public void appDisconnect(IConnection conn) {
    	String clientId = Red5.getConnectionLocal().getClient().getId();
    	String userid = getUserId();
    	String username = getUsername();
    	
        String remoteHost = Red5.getConnectionLocal().getRemoteAddress();
        int remotePort = Red5.getConnectionLocal().getRemotePort();    	
    	log.info("[clientid={}] disconnnected from {}.", clientId, remoteHost + ":" + remotePort);
        log.debug("{} [clientid={}] is leaving the voice conf app. Removing from ConnectionManager.", username + "[uid=" + userid + "]", clientId);
    	
        clientConnManager.removeClient(clientId);

        String peerId = (String) Red5.getConnectionLocal().getAttribute("VOICE_CONF_PEER");
        if (peerId != null) {
			try {
				log.debug("Forcing hang up {} [clientid={}] in case the user is still in the conference.", username + "[uid=" + userid + "]", clientId);
				sipPeerManager.hangup(peerId, clientId);
			} catch (PeerNotFoundException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        }
    }
    
    @Override
    public void streamPublishStart(IBroadcastStream stream) {
    	String clientId = Red5.getConnectionLocal().getClient().getId();
    	String userid = getUserId();
    	String username = getUsername();
    	
    	log.debug("{} has started publishing stream [{}]", username + "[uid=" + userid + "][clientid=" + clientId + "]", stream.getPublishedName());
    	System.out.println("streamPublishStart: " + stream.getPublishedName());
    	IConnection conn = Red5.getConnectionLocal();
    	String peerId = (String) conn.getAttribute("VOICE_CONF_PEER");
        if (peerId != null) {
        	super.streamPublishStart(stream);
	    	sipPeerManager.startTalkStream(peerId, clientId, stream, conn.getScope());
//	    	recordStream(stream);
        }
    }
    
    /**
     * A hook to record a sample stream. A file is written in webapps/sip/streams/
     * @param stream
     */
    private void recordStream(IBroadcastStream stream) {
    	IConnection conn = Red5.getConnectionLocal();     
    	String streamName = stream.getPublishedName();
     
    	try {
    		ClientBroadcastStream cstream = (ClientBroadcastStream) this.getBroadcastStream(conn.getScope(), stream.getPublishedName() );
    		cstream.saveAs(streamName, false);
    	} catch(Exception e) {
    		System.out.println("ERROR while recording stream " + e.getMessage());
    		e.printStackTrace();
    	}    	
    }
    
    @Override
    public void streamBroadcastClose(IBroadcastStream stream) {
    	String clientId = Red5.getConnectionLocal().getClient().getId();
    	String userid = getUserId();
    	String username = getUsername();
    	
    	log.debug("{} has stopped publishing stream [{}]", username + "[uid=" + userid + "][clientid=" + clientId + "]", stream.getPublishedName());
    	IConnection conn = Red5.getConnectionLocal();
    	String peerId = (String) conn.getAttribute("VOICE_CONF_PEER");
        if (peerId != null) {
        	super.streamPublishStart(stream);	    	
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
    	sipServerHost = h.trim();
    }
    
    public void setUsername(String un) {
    	this.username = un.trim();
    }
    
    public void setPassword(String pw) {
    	this.password = pw.trim();
    }
    
    public void setSipPort(int sipPort) {
		this.sipPort = sipPort;
	}

	public void setStartAudioPort(int startRTPPort) {
		this.startAudioPort = startRTPPort;
	}

	public void setStopAudioPort(int stopRTPPort) {
		this.stopAudioPort = stopRTPPort;
	}
	
	public void setSipPeerManager(SipPeerManager spm) {
		sipPeerManager = spm;
	}
	
	public void setClientConnectionManager(ClientConnectionManager ccm) {
		clientConnManager = ccm;
	}
	
	private String getUserId() {
		String userid = (String) Red5.getConnectionLocal().getAttribute("USERID");
		if ((userid == null) || ("".equals(userid))) userid = "unknown-userid";
		return userid;
	}
	
	private String getUsername() {
		String username = (String) Red5.getConnectionLocal().getAttribute("USERNAME");
		if ((username == null) || ("".equals(username))) username = "UNKNOWN-CALLER";
		return username;
	}
}
