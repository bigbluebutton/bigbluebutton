package org.bigbluebutton.voice.conf.sip;

import org.slf4j.Logger;
import org.zoolu.sip.provider.SipStack;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IScope;
import org.red5.server.api.stream.IBroadcastStream;

import java.util.*;

public final class SipPeerManager {
	private static final Logger log = Red5LoggerFactory.getLogger( SipPeerManager.class, "sip" );
	
    private Map<String, SipPeer> sipPeers;
    private int sipStackDebugLevel = 8;
    
    public SipPeerManager() {
        sipPeers = Collections.synchronizedMap(new HashMap<String, SipPeer>());
    }

    public void createSipUser(String userid, ConnectionClientMethodInvoker connection, int sipPort, int rtpPort) {
    	SipPeer sipUser = new SipPeer(userid, sipPort, rtpPort);
    	sipPeers.put(userid, sipUser);
    }
    
    public void login(String userid, String obproxy, String phone, String username, String password, String realm, String proxy) {
    	SipPeer sipUser = sipPeers.get(userid);
    	if (sipUser != null) {
    		sipUser.login(obproxy, phone, username, password, realm, proxy);
    	}
    }
    
    public void registerSipUser(String userid) {
    	SipPeer sipUser = sipPeers.get(userid);
    	if (sipUser != null) {
    		sipUser.register();
    	}
    }
    
    public void call(String userid, String destination) {
    	SipPeer sipUser = sipPeers.get(userid);
    	if (sipUser != null) {
    		sipUser.call(destination);
    	}
    }
    
    public void passDtmf(String userid, String digits) {
    	SipPeer sipUser = sipPeers.get(userid);
    	if (sipUser != null) {
    		sipUser.dtmf(digits);
    	}
    }
    
    public void accept(String userid) {
    	SipPeer sipUser = sipPeers.get(userid);
    	if (sipUser != null) {
    		sipUser.accept();
    	}
    }
    
    public void unregister(String userid) {
    	SipPeer sipUser = sipPeers.get(userid);
    	if (sipUser != null) {
    		sipUser.unregister();
    	}
    }
    
    public void hangup(String userid) {
    	SipPeer sipUser = sipPeers.get(userid);
    	if (sipUser != null) {
    		sipUser.hangup();
    	}
    }
        
    public void startTalkStream(String userid, IBroadcastStream broadcastStream, IScope scope) {
    	SipPeer sipUser = sipPeers.get(userid);
    	if (sipUser != null) {
    		sipUser.startTalkStream(broadcastStream, scope);
    	}
    }
    
    public void stopTalkStream(String userid, IBroadcastStream broadcastStream, IScope scope) {
    	SipPeer sipUser = sipPeers.get(userid);
    	if (sipUser != null) {
    		sipUser.stopTalkStream(broadcastStream, scope);
    	}
    }
    
    private void remove(String userid) {
    	log.debug("Number of SipUsers in Manager before remove {}", sipPeers.size());
        sipPeers.remove(userid);
    }


    public Collection< SipPeer > getSIPUsers() {
        return sipPeers.values();
    }


    public int getNumberOfSessions() {
        return sipPeers.size();
    }


    public void close(String userid) {
    	SipPeer sipUser = sipPeers.get(userid);
    	if (sipUser != null) {
    		sipUser.close();
    		remove(userid);
    	}
    }

    public void destroyAllSessions() {
        Collection sipUsers = getSIPUsers();
        SipPeer sipUser;

        for (Iterator iter = sipUsers.iterator(); iter.hasNext();) {
            sipUser = (SipPeer) iter.next();
            sipUser.close();

            sipUser = null;
        }

        sipPeers = new HashMap<String, SipPeer>();
    }

	public void setSipStackDebugLevel(int sipStackDebugLevel) {
		this.sipStackDebugLevel = sipStackDebugLevel;
		initializeSipStack();
	}

	private void initializeSipStack() {
        SipStack.init();
        SipStack.debug_level = sipStackDebugLevel;
        SipStack.log_path = "log";    	
    }
}
