package org.bigbluebutton.voice.conf.sip;

import org.zoolu.sip.provider.*;
import org.zoolu.net.SocketAddress;
import org.slf4j.Logger;
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
		SipPeerProfile regProfile = createRegisterUserProfile(username, password);
		
        if (sipProvider != null) {
        	registerAgent = new SipRegisterAgent(sipProvider, regProfile.fromUrl, 
        			regProfile.contactUrl, regProfile.username, 
        			regProfile.realm, regProfile.passwd);
        	registerAgent.addListener(this);
        	registerAgent.register(regProfile.expires, regProfile.expires/2, regProfile.keepaliveTime);
        }                              
    }
    
    private SipPeerProfile createRegisterUserProfile(String username, String password) {    	    	
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
    
    private void initializeUserAgent() {
    	userAgent = new CallAgent(sipProvider, userProfile, rtmpConnection);
    	userAgent.addListener(rtmpConnection);
        userAgent.initialize();
    }
               
    public void dtmf(String digits) {
    	log.debug("SIPUser dtmf " + digits);
        if (userAgent != null) {
        	userAgent.queueSipDtmfDigits( digits );
        }
    }

    public void call(String clientId, String callerName, String destination) {
    	SipPeerProfile callerProfile = createCallSipProfile(callerName, destination);    	
    	CallAgent ca = new CallAgent(sipProvider, callerProfile, clientId);
    	ca.setClientConnectionManager(clientConnManager);
    	ca.setCallStreamFactory(callStreamFactory);
    	ca.call(destination);
    }

	/** Add by Lior call transfer test */
	public void transfer(String transferTo) {
	   log.debug("Transfer To: " + transferTo);

	   if (transferTo.indexOf("@") == -1) {
		   transferTo = transferTo + "@" + proxy ;
	   }

	   userAgent.transfer(transferTo);
	}
	/** end of transfer code */

	public void close() {
		log.debug("SIPUser close1");
        try {
			hangup();
			unregister();
		    new Thread().sleep(3000);
		} catch(Exception e) {
			log.error("close: Exception:>\n" + e);
		}

       log.debug("Stopping SipProvider");
       sipProvider.halt();
	}

    public void accept() {
    	log.debug( "SIPUser accept" );

        if (userAgent != null) {
            userAgent.accept();
        }
    }

    public void hangup() {
    	log.debug( "SIPUser hangup" );

        if (userAgent != null) {
           userAgent.hangup();
        }

    }

    public void unregister() {
    	log.debug( "SIPUser unregister" );

        if (registerAgent != null) {
            registerAgent.unregister();
            registerAgent = null;
        }

        if (userAgent != null) {
            userAgent.hangup();
        }
        userAgent = null;
    }

    public void startTalkStream(IBroadcastStream broadcastStream, IScope scope) {
    	if (userAgent != null)
    		userAgent.startTalkStream(broadcastStream, scope);
    }
    
    public void stopTalkStream(IBroadcastStream broadcastStream, IScope scope) {
    	if (userAgent != null)
    		userAgent.stopTalkStream(broadcastStream, scope);
    }
    
    public String getSessionID() {
        return userid;
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
