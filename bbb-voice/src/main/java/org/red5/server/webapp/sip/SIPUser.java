package org.red5.server.webapp.sip;


import java.io.IOException;

import org.red5.server.api.service.IServiceCapableConnection;
import org.red5.server.api.IConnection;

import org.zoolu.sip.address.*;
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
    private String optOutboundProxy = null;
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

    private String realm;

    private String obproxy;

    public SIPUser( String sessionID, IConnection service, int sipPort, int rtpPort ) throws IOException {

        log.debug( "SIPUser Constructor: sip port " + sipPort + " rtp port:" + rtpPort );

        try {
            this.sessionID = sessionID;
            this.service = service;
            this.sipPort = sipPort;
            this.rtpPort = rtpPort;
        }
        catch ( Exception e ) {
        	log.error( "SIPUser constructor: Exception:>\n" + e );
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


    public void login( String obproxy, String phone, String username, String password, String realm, String proxy ) {

    	log.debug( "SIPUser login" );

        this.username = username;
        this.password = password;
        this.proxy = proxy;
		this.opt_outbound_proxy = obproxy;
		this.realm = realm;

        String fromURL = "\"" + phone + "\" <sip:" + phone + "@" + proxy + ">";

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
            log.error( "login: Exception:>\n" + e );
        }
    }


    public void register() {

    	log.debug( "SIPUser register" );

        try {

            if ( sipProvider != null ) {
                ra = new SIPRegisterAgent( sipProvider, userProfile.fromUrl, userProfile.contactUrl, username,
                    userProfile.realm, password, this );
                loopRegister( userProfile.expires, userProfile.expires / 2, userProfile.keepaliveTime );
            }

        }
        catch ( Exception e ) {
        	log.error( "register: Exception:>\n" + e );
        }
    }


    public void dtmf( String digits ) {

    	log.debug( "SIPUser dtmf " + digits );

        try {

            if ( ua != null && ua.audioApp != null && ua.audioApp.sender != null ) {
                ua.audioApp.sender.queueSipDtmfDigits( digits );
            }

        }
        catch ( Exception e ) {
        	log.error( "dtmf: Exception:>\n" + e );
        }
    }


    public void call( String destination ) {

        log.debug( "SIPUser Calling " + destination );

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
        	log.error( "call: Exception:>\n" + e );
        }
    }

	/** Add by Lior call transfer test */


	   public void transfer( String transferTo ) {

	           p( "Transfer To: " + transferTo );

	           try {
	               if (transferTo.indexOf("@") == -1) {
					transferTo = transferTo + "@" + proxy ;
			   }

	               ua.transfer( transferTo );

	           }
	           catch ( Exception e ) {
	               p( "call: Exception:>\n" + e );
	           }
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
	    service = null;
	}


    public void accept() {

    	log.debug( "SIPUser accept" );

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
            	log.error( "SIPUser: accept - Exception:>\n" + e );
            }
        }
    }


    public void hangup() {

    	log.debug( "SIPUser hangup" );

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

    	log.debug( "SIPUser streamStatus " + status );

        if ( "stop".equals( status ) ) {
            // ua.listen();
        }
    }


    public void unregister() {

    	log.debug( "SIPUser unregister" );

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

        p( "onUaCallIncoming " + source + " " + destination);

        if ( service != null ) {
            ( (IServiceCapableConnection) service ).invoke( "incoming", new Object[] { source, sourceName, destination,
                destinationName } );
        }
    }


    public void onUaCallRinging( SIPUserAgent ua ) {
        p( "onUaCallRinging" );

        if ( service != null ) {
            ( (IServiceCapableConnection) service ).invoke( "callState", new Object[] { "onUaCallRinging" } );
        }
    }


    public void onUaCallAccepted( SIPUserAgent ua ) {
        p( "onUaCallAccepted" );

        if ( service != null ) {
            ( (IServiceCapableConnection) service ).invoke( "callState", new Object[] { "onUaCallAccepted" } );
        }

    }


    public void onUaCallConnected( SIPUserAgent ua ) {

    	log.debug( "SIP Call Connected" );
        sipReady = true;

        if ( service != null ) {
            ( (IServiceCapableConnection) service ).invoke( "connected", new Object[] { playName, publishName } );
        }

    }


    public void onUaCallTrasferred( SIPUserAgent ua ) {
        p( "onUaCallTrasferred");

		 if (service != null) {
		 	((IServiceCapableConnection) service).invoke("callState", new Object[] {"onUaCallTrasferred"});
		}

    }


    public void onUaCallCancelled( SIPUserAgent ua ) {
        p( "onUaCallCancelled");

        sipReady = false;
        closeStreams();

        if ( service != null ) {
            ( (IServiceCapableConnection) service ).invoke( "callState", new Object[] { "onUaCallCancelled" } );
        }

        ua.listen();
    }


    public void onUaCallFailed( SIPUserAgent ua ) {
        p( "onUaCallFailed");

        sipReady = false;
        closeStreams();

        if ( service != null ) {
            ( (IServiceCapableConnection) service ).invoke( "callState", new Object[] { "onUaCallFailed" } );
        }

        ua.listen();
    }


    public void onUaCallClosed( SIPUserAgent ua ) {
        p( "onUaCallClosed");

        sipReady = false;
        closeStreams();

        if ( service != null ) {
            ( (IServiceCapableConnection) service ).invoke( "callState", new Object[] { "onUaCallClosed" } );
        }

        ua.listen();
    }


    public void onUaRegistrationSuccess( SIPRegisterAgent ra, NameAddress target, NameAddress contact, String result ) {

    	log.debug( "SIP Registration success " + result );

        if ( service != null ) {
            ( (IServiceCapableConnection) service ).invoke( "registrationSucess", new Object[] { result } );
        }
    }


    public void onUaRegistrationFailure( SIPRegisterAgent ra, NameAddress target, NameAddress contact, String result ) {

    	log.debug( "SIP Registration failure " + result );

        if ( service != null ) {
            ( (IServiceCapableConnection) service ).invoke( "registrationFailure", new Object[] { result } );
        }
    }


	public void onUaUnregistedSuccess() {
		// TODO Auto-generated method stub
		
	}

        log.debug( s );
		System.out.println("[SIPUser] " + s);
    }
}
