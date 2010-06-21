package org.bigbluebutton.voiceconf.sip;

import java.util.Collection;
import java.util.Iterator;

import org.zoolu.sip.provider.*;
import org.zoolu.net.SocketAddress;
import org.slf4j.Logger;
import org.bigbluebutton.voiceconf.red5.CallStreamFactory;
import org.bigbluebutton.voiceconf.red5.ClientConnectionManager;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IScope;
import org.red5.server.api.stream.IBroadcastStream;

/**
 * Class that is a peer to the sip server. This class will maintain
 * all calls to it's peer server.
 * @author Richard Alam
 *
 */
public class SipPeer implements SipRegisterAgentListener {
    private static Logger log = Red5LoggerFactory.getLogger(SipPeer.class, "sip");

    private ClientConnectionManager clientConnManager;
    private CallStreamFactory callStreamFactory;
    
    private CallManager callManager = new CallManager();
    
    private SipProvider sipProvider;
    private SipRegisterAgent registerAgent;
    private final String id;
    private final String host;
    private final int sipPort;
    private final int startRtpPort;
    private final int stopRtpPort;
    private boolean registered = false;
    private String username;
    private String password;
    
    public SipPeer(String id, String host, int sipPort, int startRtpPort, int stopRtpPort) {
        this.id = id;
        this.host = host;
        this.sipPort = sipPort;
        this.startRtpPort = startRtpPort;
        this.stopRtpPort = stopRtpPort;
        
        initSipProvider(sipPort);                
    }
    
    private void initSipProvider(int sipPort) {
        sipProvider = new SipProvider(host, sipPort);        
        sipProvider.addSipProviderListener(new OptionMethodListener());    	
    }
    
    public void register(String username, String password) {
    	log.debug( "SIPUser register" );
    	this.username = username;
    	this.password = password;
    	
		sipProvider.setOutboundProxy(new SocketAddress(host));   
		SipPeerProfile regProfile = createRegisterUserProfile();
		
        if (sipProvider != null) {
        	registerAgent = new SipRegisterAgent(sipProvider, regProfile.fromUrl, 
        			regProfile.contactUrl, regProfile.username, 
        			regProfile.realm, regProfile.passwd);
        	registerAgent.addListener(this);
        	registerAgent.register(regProfile.expires, regProfile.expires/2, regProfile.keepaliveTime);
        }                              
    }
    
    private SipPeerProfile createRegisterUserProfile() {    	    	
    	SipPeerProfile userProfile = new SipPeerProfile();
        userProfile.audioPort = startRtpPort;
            	
        String fromURL = "\"" + username + "\" <sip:" + username + "@" + host + ">";
    	userProfile.username = username;
        userProfile.passwd = password;
        userProfile.realm = host;
        userProfile.fromUrl = fromURL;
		userProfile.contactUrl = "sip:" + username + "@" + sipProvider.getViaAddress();
        if (sipProvider.getPort() != SipStack.default_port) {
            userProfile.contactUrl += ":" + sipProvider.getPort();
        }		
        userProfile.keepaliveTime=8000;
		userProfile.acceptTime=0;
		userProfile.hangupTime=20;   
		return userProfile;
    }
    
    private SipPeerProfile createCallSipProfile(String callerName, String destination) {    	    	
    	SipPeerProfile userProfile = new SipPeerProfile();
        userProfile.audioPort = startRtpPort;
            	
        String fromURL = "\"" + callerName + "\" <sip:" + destination + "@" + host + ">";
    	userProfile.username = callerName;
        userProfile.passwd = password;
        userProfile.realm = host;
        userProfile.fromUrl = fromURL;
		userProfile.contactUrl = "sip:" + destination + "@" + sipProvider.getViaAddress();
        if (sipProvider.getPort() != SipStack.default_port) {
            userProfile.contactUrl += ":" + sipProvider.getPort();
        }		
        userProfile.keepaliveTime=8000;
		userProfile.acceptTime=0;
		userProfile.hangupTime=20;   
		return userProfile;
    }
    
    public void call(String clientId, String callerName, String destination) {
    	if (!registered) {
    		log.warn("Call request for {} but not registered.", id);
    		return;
    	}
    	
    	SipPeerProfile callerProfile = createCallSipProfile(callerName, destination);    	
    	CallAgent ca = new CallAgent(sipProvider, callerProfile, clientId);
    	ca.setClientConnectionManager(clientConnManager);
    	ca.setCallStreamFactory(callStreamFactory);
    	callManager.add(ca);
    	ca.call(destination);
    }

	public void close() {
		log.debug("SIPUser close1");
        try {
			unregister();
		} catch(Exception e) {
			log.error("close: Exception:>\n" + e);
		}

       log.debug("Stopping SipProvider");
       sipProvider.halt();
	}

    public void hangup(String clientId) {
    	log.debug( "SIPUser hangup" );

    	CallAgent ca = callManager.get(clientId);
        if (ca != null) {
           ca.hangup();
        }
    }

    public void unregister() {
    	log.debug( "SIPUser unregister" );

    	Collection<CallAgent> calls = callManager.getAll();
    	for (Iterator<CallAgent> iter = calls.iterator(); iter.hasNext();) {
    		CallAgent ca = (CallAgent) iter.next();
    		ca.hangup();
    	}
    	
        if (registerAgent != null) {
            registerAgent.unregister();
            registerAgent = null;
        }
    }

    public void startTalkStream(String clientId, IBroadcastStream broadcastStream, IScope scope) {
    	CallAgent ca = callManager.get(clientId);
        if (ca != null) {
           ca.startTalkStream(broadcastStream, scope);
        }
    }
    
    public void stopTalkStream(String clientId, IBroadcastStream broadcastStream, IScope scope) {
    	CallAgent ca = callManager.get(clientId);
        if (ca != null) {
           ca.stopTalkStream(broadcastStream, scope);
        }
    }

	@Override
	public void onRegistrationFailure(String result) {
		log.error("Failed to register with Sip Server.");
		registered = false;
	}

	@Override
	public void onRegistrationSuccess(String result) {
		log.info("Successfully registered with Sip Server.");
		registered = true;
	}

	@Override
	public void onUnregistedSuccess() {
		log.info("Successfully unregistered with Sip Server");
		registered = false;
	}
	
	public void setCallStreamFactory(CallStreamFactory csf) {
		callStreamFactory = csf;
	}
	
	public void setClientConnectionManager(ClientConnectionManager ccm) {
		clientConnManager = ccm;
	}
}
