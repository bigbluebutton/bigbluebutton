package org.red5.server.webapp.sip;


import java.io.IOException;
import java.io.PipedOutputStream;

import org.red5.server.api.service.IServiceCapableConnection;
import org.red5.server.api.IConnection;

import org.zoolu.sip.address.*;
import org.zoolu.sip.message.SipMethods;
import org.zoolu.sip.provider.*;
import org.zoolu.net.SocketAddress;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

public class SIPUser implements SIPUserAgentListener, SIPRegisterAgentListener {

    protected static Logger log = Red5LoggerFactory.getLogger( SIPUser.class, "sip" );

    public boolean sipReady = false;

    private IConnection service;

    private long lastCheck;

    private String sessionID;

    private SIPUserAgentProfile userProfile;

    private SipProvider sipProvider;

    private boolean optRegist = false;

    private boolean optUnregist = false;

    private boolean optUnregistAll = false;

    private int optExpires = -1;

    private long optKeepaliveTime = -1;

    private boolean optNoOffer = false;

    private String optCallTo = null;

    private int optAcceptTime = -1;

    private int optHangupTime = -1;

    private String optRedirectTo = null;

    private String optTransferTo = null;

    private int optTransferTime = -1;

    private int optReInviteTime = -1;

    private boolean optAudio = false;

    private boolean optVideo = false;

    private int optMediaPort = 0;

    private boolean optRecvOnly = false;

    private boolean optSendOnly = false;

    private boolean optSendTone = false;

    private String optSendFile = null;

    private String optRecvFile = null;

    private boolean optNoPrompt = false;

    private String optFromUrl = null;

    private String optContactUrl = null;

    private String optUsername = null;

    private String optRealm = null;

    private String optPasswd = null;

    private int optDebugLevel = -1;

    private String optOutboundProxy = null;

    private String optViaAddr = SipProvider.AUTO_CONFIGURATION;

    private int optHostPort = SipStack.default_port;

    private SIPUserAgent ua;

    private SIPRegisterAgent ra;

    private RTMPUser rtmpUser;

    private PipedOutputStream publishStream;

    private String username;

    private String password;

    private String publishName;

    private String playName;

    private int sipPort;

    private int rtpPort;

    private String proxy;


    public SIPUser( String sessionID, IConnection service, int sipPort, int rtpPort ) throws IOException {

        p( "SIPUser Constructor: sip port " + sipPort + " rtp port:" + rtpPort );

        try {

            this.sessionID = sessionID;
            this.service = service;
            this.sipPort = sipPort;
            this.rtpPort = rtpPort;

        }
        catch ( Exception e ) {
            p( "SIPUser constructor: Exception:>\n" + e );

        }
    }


    public boolean isRunning() {

        boolean resp = false;

        try {
            resp = ua.audioApp.receiver.isRunning();

        }
        catch ( Exception e ) {
            resp = false;
        }

        return resp;
    }


    public void login( String phone, String username, String password, String realm, String proxy ) {

        p( "SIPUser login" );

        this.username = username;
        this.password = password;
        this.proxy = proxy;
		this.optOutboundProxy = proxy;

        String fromURL = "\"" + username + "\" <sip:" + phone + "@" + proxy + ">";

        try {
            rtmpUser = new RTMPUser();
            SipStack.init();
            SipStack.debug_level = 8;
            SipStack.log_path = "log";

            sipProvider = new SipProvider( null, sipPort );
            sipProvider.setOutboundProxy(new SocketAddress(optOutboundProxy));

            sipProvider.addSipProviderListener(new OptionMethodListener());
            //sipProvider.addSipProviderListener(new Identifier(SipMethods.OPTION), new OptionMethodListener());
            
            userProfile = new SIPUserAgentProfile();
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

            ua = new SIPUserAgent( sipProvider, userProfile, this, rtmpUser );

            sipReady = false;
            ua.listen();

        }
        catch ( Exception e ) {
            p( "login: Exception:>\n" + e );
        }
    }


    public void register() {

        p( "SIPUser register" );

        try {

            if ( sipProvider != null ) {
                ra = new SIPRegisterAgent( sipProvider, userProfile.fromUrl, userProfile.contactUrl, username,
                    userProfile.realm, password, this );
                loopRegister( userProfile.expires, userProfile.expires / 2, userProfile.keepaliveTime );
            }

        }
        catch ( Exception e ) {
            p( "register: Exception:>\n" + e );
        }
    }


    public void dtmf( String digits ) {

        p( "SIPUser dtmf " + digits );

        try {

            if ( ua != null && ua.audioApp != null && ua.audioApp.sender != null ) {
                ua.audioApp.sender.queueSipDtmfDigits( digits );
            }

        }
        catch ( Exception e ) {
            p( "dtmf: Exception:>\n" + e );
        }
    }


    public void call( String destination ) {

        p( "SIPUser Calling " + destination );

        try {

            publishName = "microphone_" + System.currentTimeMillis();
            playName = "speaker_" + System.currentTimeMillis();

            rtmpUser.startStream( "localhost", "sip", 1935, publishName, playName );

            sipReady = false;
            ua.setMedia( rtmpUser );
            ua.hangup();

            if ( destination.indexOf( "@" ) == -1 ) {
                destination = destination + "@" + proxy;
            }

            if ( destination.indexOf( "sip:" ) > -1 ) {
                destination = destination.substring( 4 );
            }

            ua.call( destination );

        }
        catch ( Exception e ) {
            p( "call: Exception:>\n" + e );
        }
    }


	public void close() {
		p("SIPUser close1");
         try {

			hangup();
			unregister();
		    new Thread().sleep(3000);

		} catch(Exception e) {
			p("close: Exception:>\n" + e);
		}

        try {
            p("SIPUser provider.halt");
			sipProvider.halt();

	    } catch(Exception e) {
			p("close: Exception:>\n" + e);
	    }
	}


    public void accept() {

        p( "SIPUser accept" );

        if ( ua != null ) {

            try {
                publishName = "microphone_" + System.currentTimeMillis();
                playName = "speaker_" + System.currentTimeMillis();

                rtmpUser.startStream( "localhost", "sip", 1935, publishName, playName );

                sipReady = false;
                ua.setMedia( rtmpUser );
                ua.accept();

            }
            catch ( Exception e ) {
                p( "SIPUser: accept - Exception:>\n" + e );
            }
        }
    }


    public void hangup() {

        p( "SIPUser hangup" );

        if ( ua != null ) {

            if ( ua.call_state != SIPUserAgent.UA_IDLE ) {
                ua.hangup();
                ua.listen();
            }
        }

        closeStreams();
        rtmpUser.stopStream();
    }


    public void streamStatus( String status ) {

        p( "SIPUser streamStatus " + status );

        if ( "stop".equals( status ) ) {
            // ua.listen();
        }
    }


    public void unregister() {

        p( "SIPUser unregister" );

        if ( ra != null ) {
            if ( ra.isRegistering() ) {
                ra.halt();
            }
            ra.unregister();
            ra = null;
        }

        if ( ua != null ) {
            ua.hangup();
        }
        ua = null;
    }


    private void closeStreams() {

        p( "SIPUser closeStreams" );

        try {

        }
        catch ( Exception e ) {
            p( "closeStreams: Exception:>\n" + e );
        }
    }


    public long getLastCheck() {

        return lastCheck;
    }


    public boolean isClosed() {

        return ua == null;
    }


    public String getSessionID() {

        return sessionID;
    }


    private void loopRegister( int expire_time, int renew_time, long keepalive_time ) {

        if ( ra.isRegistering() ) {
            ra.halt();
        }
        ra.loopRegister( expire_time, renew_time, keepalive_time );
    }


    public void onUaCallIncoming( SIPUserAgent ua, NameAddress callee, NameAddress caller ) {

        String source = caller.getAddress().toString();
        String sourceName = caller.hasDisplayName() ? caller.getDisplayName() : "";
        String destination = callee.getAddress().toString();
        String destinationName = callee.hasDisplayName() ? callee.getDisplayName() : "";

        if ( service != null ) {
            ( (IServiceCapableConnection) service ).invoke( "incoming", new Object[] { source, sourceName, destination,
                destinationName } );
        }
    }


    public void onUaCallRinging( SIPUserAgent ua ) {

        if ( service != null ) {
            ( (IServiceCapableConnection) service ).invoke( "callState", new Object[] { "onUaCallRinging" } );
        }
    }


    public void onUaCallAccepted( SIPUserAgent ua ) {

        if ( service != null ) {
            ( (IServiceCapableConnection) service ).invoke( "callState", new Object[] { "onUaCallAccepted" } );
        }

    }


    public void onUaCallConnected( SIPUserAgent ua ) {

        p( "SIP Call Connected" );
        sipReady = true;

        if ( service != null ) {
            ( (IServiceCapableConnection) service ).invoke( "connected", new Object[] { playName, publishName } );
        }

    }


    public void onUaCallTrasferred( SIPUserAgent ua ) {

    }


    public void onUaCallCancelled( SIPUserAgent ua ) {

        sipReady = false;
        closeStreams();

        if ( service != null ) {
            ( (IServiceCapableConnection) service ).invoke( "callState", new Object[] { "onUaCallCancelled" } );
        }

        ua.listen();
    }


    public void onUaCallFailed( SIPUserAgent ua ) {

        sipReady = false;
        closeStreams();

        if ( service != null ) {
            ( (IServiceCapableConnection) service ).invoke( "callState", new Object[] { "onUaCallFailed" } );
        }

        ua.listen();
    }


    public void onUaCallClosed( SIPUserAgent ua ) {

        sipReady = false;
        closeStreams();

        if ( service != null ) {
            ( (IServiceCapableConnection) service ).invoke( "callState", new Object[] { "onUaCallClosed" } );
        }

        ua.listen();
    }


    public void onUaRegistrationSuccess( SIPRegisterAgent ra, NameAddress target, NameAddress contact, String result ) {

        p( "SIP Registration success " + result );

        if ( service != null ) {
            ( (IServiceCapableConnection) service ).invoke( "registrationSucess", new Object[] { result } );
        }
    }


    public void onUaRegistrationFailure( SIPRegisterAgent ra, NameAddress target, NameAddress contact, String result ) {

        p( "SIP Registration failure " + result );

        if ( service != null ) {
            ( (IServiceCapableConnection) service ).invoke( "registrationFailure", new Object[] { result } );
        }
    }


    private void p( String s ) {

        log.debug( s );
		System.out.println(s);
    }
}
