package org.bigbluebutton.voice.conf.sip;

import org.zoolu.sip.provider.*;
import org.zoolu.net.SocketAddress;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IScope;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.app.sip.registration.SipRegisterAgent;

public class SipPeer {
    private static Logger log = Red5LoggerFactory.getLogger(SipPeer.class, "sip");

    private ConnectionClientMethodInvoker rtmpConnection;
    private String userid;
    private SipPeerProfile userProfile;
    private SipProvider sipProvider;
    private CallAgent userAgent;
    private SipRegisterAgent registerAgent;
    private String host;
    private int sipPort;
    private int startRtpPort;
    private int stopRtpPort;

    public SipPeer(String host, int sipPort, int startRtpPort, int stopRtpPort) {
        log.debug( "SIPUser Constructor: sip port " + sipPort);
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
    	log.debug( "SIPUser login" );
		sipProvider.setOutboundProxy(new SocketAddress(host));   
		initializeUserProfile(username, password);
        initializeUserAgent();                              
    }
    
    private void initializeUserProfile(String username, String password) {    	    	
    	userProfile = new SipPeerProfile();
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
    }
    
    private void setupUserProfile(String username, String password, String host, String phone) {

    }
    
    private void initializeUserAgent() {
    	userAgent = new CallAgent(sipProvider, userProfile, rtmpConnection);
    	userAgent.addListener(rtmpConnection);
        userAgent.initialize();
    }
        

       
    public void register() {
    	log.debug( "SIPUser register" );
        if (sipProvider != null) {
        	registerAgent = new SipRegisterAgent(sipProvider, userProfile.fromUrl, userProfile.contactUrl, 
        			userProfile.username, userProfile.realm, userProfile.passwd);
        	registerAgent.addListener(rtmpConnection);
        	registerAgent.register(userProfile.expires, userProfile.expires/2, userProfile.keepaliveTime);
        }
    }

    public void dtmf(String digits) {
    	log.debug("SIPUser dtmf " + digits);
        if (userAgent != null) {
        	userAgent.queueSipDtmfDigits( digits );
        }
    }

    public void call(String destination) {
        log.debug( "SIPUser Calling " + destination );

        if (userAgent != null)
        	userAgent.hangup();

        if (destination.indexOf("@") == -1) {
        	destination = destination + "@" + proxy;
        }

        if (destination.indexOf("sip:") > -1) {
        	destination = destination.substring(4);
        }

        if (userAgent != null)
        	userAgent.call(destination);
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
}
