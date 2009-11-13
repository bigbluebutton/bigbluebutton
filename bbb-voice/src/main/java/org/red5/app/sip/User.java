package org.red5.app.sip;

import java.io.IOException;
import java.io.PipedOutputStream;

import org.red5.server.api.service.IServiceCapableConnection;
import org.red5.server.api.IConnection;

import org.zoolu.sip.address.*;
import org.zoolu.sip.provider.*;
import org.zoolu.net.SocketAddress;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

public class User implements UserAgentListener, RegisterAgentListener {
    protected static Logger log = Red5LoggerFactory.getLogger( User.class, "sip" );

    public boolean sipReady = false;
    private IConnection connectionService;
    private long lastCheck;
    private String sessionID;
    private UserAgentProfile userProfile;
    private SipProvider sipProvider;
    private String optOutboundProxy = null;
    private UserAgent userAgent;
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
    private String obproxy;

    public User( String sessionID, IConnection service, int sipPort, int rtpPort ) throws IOException {
        log.debug( "SIPUser Constructor: sip port " + sipPort + " rtp port:" + rtpPort );

        try {
            this.sessionID = sessionID;
            this.connectionService = service;
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
            resp = userAgent.audioApp.receiver.isRunning();
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
		this.optOutboundProxy = obproxy;
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

            userProfile = new UserAgentProfile();
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

            userAgent = new UserAgent( sipProvider, userProfile, this, rtmpUser );

            sipReady = false;
            userAgent.listen();
        }
        catch ( Exception e ) {
            log.error( "login: Exception:>\n" + e );
        }
    }
    
    public void register() {
    	log.debug( "SIPUser register" );
        try {
            if ( sipProvider != null ) {
                registerAgent = new RegisterAgent( sipProvider, userProfile.fromUrl, userProfile.contactUrl, username,
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
            if ( userAgent != null && userAgent.audioApp != null && userAgent.audioApp.sender != null ) {
                userAgent.audioApp.sender.queueSipDtmfDigits( digits );
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
            userAgent.setMedia( rtmpUser );
            userAgent.hangup();

            if ( destination.indexOf( "@" ) == -1 ) {
                destination = destination + "@" + proxy;
            }

            if ( destination.indexOf( "sip:" ) > -1 ) {
                destination = destination.substring( 4 );
            }

            userAgent.call( destination );

        }
        catch ( Exception e ) {
        	log.error( "call: Exception:>\n" + e );
        }
    }

	/** Add by Lior call transfer test */
	   public void transfer( String transferTo ) {
	           log.debug( "Transfer To: " + transferTo );

	           try {
	               if (transferTo.indexOf("@") == -1) {
					transferTo = transferTo + "@" + proxy ;
			   }

	               userAgent.transfer( transferTo );

	           }
	           catch ( Exception e ) {
	               log.debug( "call: Exception:>\n" + e );
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
	    connectionService = null;
	}

    public void accept() {
    	log.debug( "SIPUser accept" );

        if ( userAgent != null ) {
            try {
                publishName = "microphone_" + System.currentTimeMillis();
                playName = "speaker_" + System.currentTimeMillis();

                rtmpUser.startStream( "localhost", "sip", 1935, publishName, playName );

                sipReady = false;
                userAgent.setMedia( rtmpUser );
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
                userAgent.listen();
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


    public String getSessionID() {
        return sessionID;
    }


    private void loopRegister( int expire_time, int renew_time, long keepalive_time ) {
        if ( registerAgent.isRegistering() ) {
            registerAgent.halt();
        }
        registerAgent.loopRegister( expire_time, renew_time, keepalive_time );
    }


    public void onUaCallIncoming( UserAgent ua, NameAddress callee, NameAddress caller ) {
        String source = caller.getAddress().toString();
        String sourceName = caller.hasDisplayName() ? caller.getDisplayName() : "";
        String destination = callee.getAddress().toString();
        String destinationName = callee.hasDisplayName() ? callee.getDisplayName() : "";

        log.debug( "onUaCallIncoming " + source + " " + destination);

        if (connectionService != null ) {
            ( (IServiceCapableConnection) connectionService ).invoke( "incoming", 
            		new Object[] { source, sourceName, destination,
            						destinationName } );
        }
    }


    public void onUaCallRinging( UserAgent ua ) {
        log.debug( "onUaCallRinging" );
        if ( connectionService != null ) {
            ( (IServiceCapableConnection) connectionService ).invoke( "callState", new Object[] { "onUaCallRinging" } );
        }
    }


    public void onUaCallAccepted( UserAgent ua ) {
        log.debug( "onUaCallAccepted" );

        if ( connectionService != null ) {
            ( (IServiceCapableConnection) connectionService ).invoke( "callState", new Object[] { "onUaCallAccepted" } );
        }

    }


    public void onUaCallConnected( UserAgent ua ) {

    	log.debug( "SIP Call Connected" );
        sipReady = true;

        if ( connectionService != null ) {
            ( (IServiceCapableConnection) connectionService ).invoke( "connected", new Object[] { playName, publishName } );
        }

    }


    public void onUaCallTrasferred( UserAgent ua ) {
        log.debug( "onUaCallTrasferred");

		 if (connectionService != null) {
		 	((IServiceCapableConnection) connectionService).invoke("callState", new Object[] {"onUaCallTrasferred"});
		}

    }


    public void onUaCallCancelled( UserAgent ua ) {
        log.debug( "onUaCallCancelled");

        sipReady = false;
        closeStreams();

        if ( connectionService != null ) {
            ( (IServiceCapableConnection) connectionService ).invoke( "callState", new Object[] { "onUaCallCancelled" } );
        }

        ua.listen();
    }


    public void onUaCallFailed( UserAgent ua ) {
        log.debug( "onUaCallFailed");

        sipReady = false;
        closeStreams();

        if ( connectionService != null ) {
            ( (IServiceCapableConnection) connectionService ).invoke( "callState", new Object[] { "onUaCallFailed" } );
        }

        ua.listen();
    }


    public void onUaCallClosed( UserAgent ua ) {
    	log.debug( "onUaCallClosed");

        sipReady = false;
        closeStreams();

        if ( connectionService != null ) {
            ( (IServiceCapableConnection) connectionService ).invoke( "callState", new Object[] { "onUaCallClosed" } );
        }

        ua.listen();
    }


    public void onUaRegistrationSuccess( RegisterAgent ra, NameAddress target, NameAddress contact, String result ) {

    	log.debug( "SIP Registration success " + result );

        if ( connectionService != null ) {
            ( (IServiceCapableConnection) connectionService ).invoke( "registrationSucess", new Object[] { result } );
        }
    }


    public void onUaRegistrationFailure( RegisterAgent ra, NameAddress target, NameAddress contact, String result ) {

    	log.debug( "SIP Registration failure " + result );

        if ( connectionService != null ) {
            ( (IServiceCapableConnection) connectionService ).invoke( "registrationFailure", new Object[] { result } );
        }
    }


	public void onUaUnregistedSuccess() {
		// TODO Auto-generated method stub
		
	}
}
