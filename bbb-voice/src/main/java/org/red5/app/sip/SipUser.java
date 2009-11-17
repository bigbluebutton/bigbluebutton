package org.red5.app.sip;

import org.zoolu.sip.address.*;
import org.zoolu.sip.provider.*;
import org.zoolu.net.SocketAddress;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

public class SipUser implements SipUserAgentListener, RegisterAgentListener {
    private static Logger log = Red5LoggerFactory.getLogger(SipUser.class, "sip");

    private RtmpConnection rtmpConnection;
    private long lastCheck;
    private String userid;
    private SipUserAgentProfile userProfile;
    private SipProvider sipProvider;
    private String optOutboundProxy = null;
    private SipUserAgent userAgent;
    private RegisterAgent registerAgent;
    private RTMPUser rtmpUser;
    private String username;
    private String password;
    private String publishName;
    private String playName;
    private int sipPort;
    private int rtpPort;
    private String proxy;
    private String realm;

    public SipUser(String userid, RtmpConnection connection, int sipPort, int rtpPort) {
        log.debug( "SIPUser Constructor: sip port " + sipPort + " rtp port:" + rtpPort );
        this.userid = userid;
        this.rtmpConnection = connection;
        this.sipPort = sipPort;
        this.rtpPort = rtpPort;
    }
/*
    public boolean isRunning() {
        boolean resp = false;

        try {
        	resp = userAgent.isReceiverRunning();
        }
        catch ( Exception e ) {
            resp = false;
        }

        return resp;
    }
*/
    public void login(String obproxy, String phone, String username, String password, String realm, String proxy) {
    	log.debug( "SIPUser login" );

        this.username = username;
        this.password = password;
        this.proxy = proxy;
		this.optOutboundProxy = obproxy;
		this.realm = realm;

        rtmpUser = new RTMPUser();

        initializeSipStack();
        initializeSipProvider();
        initializeUserProfile(phone);
        initializeUserAgent();                              
    }
    
    private void initializeUserAgent() {
    	userAgent = new SipUserAgent(sipProvider, userProfile, this, rtmpConnection);            
        userAgent.waitForIncomingCalls();
    }
    
    private void initializeSipStack() {
        SipStack.init();
        SipStack.debug_level = 8;
        SipStack.log_path = "log";    	
    }
    
    private void initializeSipProvider() {
        sipProvider = new SipProvider( null, sipPort );
        sipProvider.setOutboundProxy(new SocketAddress(optOutboundProxy));
        sipProvider.addSipProviderListener(new OptionMethodListener());    	
    }
    
    private void initializeUserProfile(String phone) {
    	String fromURL = "\"" + phone + "\" <sip:" + phone + "@" + proxy + ">";
    	
        userProfile = new SipUserAgentProfile();
        userProfile.audioPort = rtpPort;
        userProfile.username = username;
        userProfile.passwd = password;
        userProfile.realm = realm;
        userProfile.fromUrl = fromURL;
		userProfile.contactUrl = "sip:" + phone + "@" + sipProvider.getViaAddress();

        if ( sipProvider.getPort() != SipStack.default_port ) {
            userProfile.contactUrl += ":" + sipProvider.getPort();
        }

        userProfile.keepaliveTime=8000;
		userProfile.acceptTime=0;
		userProfile.hangupTime=20;    	
    }
    
    public void register() {
    	log.debug( "SIPUser register" );
        if (sipProvider != null) {
        	registerAgent = new RegisterAgent( sipProvider, userProfile.fromUrl, userProfile.contactUrl, username,
                    							userProfile.realm, password, this );
            loopRegister(userProfile.expires, userProfile.expires / 2, userProfile.keepaliveTime);
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

        userAgent.hangup();

        if (destination.indexOf("@") == -1) {
        	destination = destination + "@" + proxy;
        }

        if (destination.indexOf("sip:") > -1) {
        	destination = destination.substring(4);
        }

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

        try {
        	log.debug("SIPUser provider.halt");
			sipProvider.halt();

	    } catch(Exception e) {
	    	log.error("close: Exception:>\n" + e);
	    }
	    rtmpConnection = null;
	}

    public void accept() {
    	log.debug( "SIPUser accept" );

        if (userAgent != null) {
            try {
                userAgent.accept();
            }
            catch ( Exception e ) {
            	log.error( "SIPUser: accept - Exception:>\n" + e );
            }
        }
    }

    public void hangup() {
    	log.debug( "SIPUser hangup" );

        if ( userAgent != null ) {
            if ( userAgent.call_state != UserAgent.UA_IDLE ) {
                userAgent.hangup();
                userAgent.waitForIncomingCalls();
            }
        }

        closeStreams();
        rtmpUser.stopStream();
    }

    public void streamStatus( String status ) {
    	log.debug( "SIPUser streamStatus " + status );

        if ( "stop".equals( status ) ) {
            // ua.listen();
        }
    }

    public void unregister() {
    	log.debug( "SIPUser unregister" );

        if ( registerAgent != null ) {
            if ( registerAgent.isRegistering() ) {
                registerAgent.halt();
            }
            registerAgent.unregister();
            registerAgent = null;
        }

        if ( userAgent != null ) {
            userAgent.hangup();
        }
        userAgent = null;
    }

    private void closeStreams() {
    	log.debug( "SIPUser closeStreams" );

        try {

        }
        catch ( Exception e ) {
        	log.error( "closeStreams: Exception:>\n" + e );
        }
    }

    public long getLastCheck() {
        return lastCheck;
    }

    public boolean isClosed() {
        return userAgent == null;
    }

    public void startTalkStream(String callid) {
    	// TODO: Callid should be used when we support multiple-calls.
    	userAgent.startTalkStream();
    }
    
    public String getSessionID() {
        return userid;
    }

    private void loopRegister( int expire_time, int renew_time, long keepalive_time ) {
        if ( registerAgent.isRegistering() ) {
            registerAgent.halt();
        }
        registerAgent.loopRegister( expire_time, renew_time, keepalive_time );
    }

    public void onUaCallIncoming( SipUserAgent ua, NameAddress callee, NameAddress caller ) {
        String source = caller.getAddress().toString();
        String sourceName = caller.hasDisplayName() ? caller.getDisplayName() : "";
        String destination = callee.getAddress().toString();
        String destinationName = callee.hasDisplayName() ? callee.getDisplayName() : "";

        log.debug( "onUaCallIncoming " + source + " " + destination);
        rtmpConnection.onCallIncoming(source, sourceName, destination, destinationName);
    }

    public void onUaCallRinging( SipUserAgent ua ) {
        log.debug( "onUaCallRinging" );
        rtmpConnection.onUaCallRinging();
    }

    public void onUaCallAccepted( SipUserAgent ua ) {
        log.debug( "onUaCallAccepted" );
        rtmpConnection.onUaCallAccepted();
    }

    public void onUaCallConnected(SipUserAgent ua, String playName, String publishName) {
    	log.debug( "SIP Call Connected" );
        rtmpConnection.onUaCallConnected(playName, publishName);
    }

    public void onUaCallTrasferred( SipUserAgent ua ) {
        log.debug( "onUaCallTrasferred");
        rtmpConnection.onUaCallTrasferred();
    }

    public void onUaCallCancelled( SipUserAgent ua ) {
        log.debug( "onUaCallCancelled");
        closeStreams();
        rtmpConnection.onUaCallCancelled();
        ua.waitForIncomingCalls();
    }

    public void onUaCallFailed( SipUserAgent ua ) {
        log.debug( "onUaCallFailed");
        closeStreams();
        rtmpConnection.onUaCallFailed();
        ua.waitForIncomingCalls();
    }


    public void onUaCallClosed( SipUserAgent ua ) {
    	log.debug( "onUaCallClosed");
        closeStreams();
        rtmpConnection.onUaCallClosed();
        ua.waitForIncomingCalls();
    }

    public void onUaRegistrationSuccess( RegisterAgent ra, NameAddress target, NameAddress contact, String result ) {
    	log.debug( "SIP Registration success " + result );
        rtmpConnection.onUaRegistrationSuccess(result);
    }


    public void onUaRegistrationFailure( RegisterAgent ra, NameAddress target, NameAddress contact, String result ) {
    	log.debug( "SIP Registration failure " + result );
        rtmpConnection.onUaRegistrationFailure(result);
    }


	public void onUaUnregistedSuccess() {
		// TODO Auto-generated method stub		
	}
}
