package org.red5.server.webapp.sip;

import java.text.MessageFormat;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.red5.app.sip.UserManager;
import org.red5.app.sip.User;
import org.red5.logging.Red5LoggerFactory;

import org.red5.server.adapter.MultiThreadedApplicationAdapter;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.red5.server.api.Red5;
import org.red5.server.api.service.IServiceCapableConnection;


public class SipVoiceConferenceApplication extends MultiThreadedApplicationAdapter {
    protected static Logger log = Red5LoggerFactory.getLogger( SipVoiceConferenceApplication.class, "sip" );

    private UserManager sipManager;
    private String asteriskHost;
    private int startSIPPort = 5070;
    private int stopSIPPort = 5099;
    private int sipPort;
    private int startRTPPort = 3000;
	private int stopRTPPort = 3029;
	private int rtpPort;
	
	private MessageFormat callExtensionPattern = new MessageFormat("{0}");
    
    private Map< String, String > userNames = new HashMap< String, String >();

    @Override
    public boolean appStart( IScope scope ) {
    	log.debug( "VoiceConferenceApplication appStart[" + scope.getName() + "]");
        sipManager = UserManager.getInstance();
        sipPort = startSIPPort;
        rtpPort = startRTPPort;
        return true;
    }

    @Override
    public void appStop( IScope scope ) {
        log.debug( "VoiceConferenceApplication appStop[" + scope.getName() + "]");
        sipManager.destroyAllSessions();
    }

    @Override
    public boolean appConnect( IConnection conn, Object[] params ) {
        IServiceCapableConnection service = (IServiceCapableConnection) conn;
        log.debug( "VoiceConferenceApplication appConnect[" + conn.getClient().getId() + "," + service + "]");
        return true;
    }

    @Override
    public boolean appJoin( IClient client, IScope scope ) {
        log.debug( "VoiceConferenceApplication appJoin[" + client.getId() + "]");
        IConnection conn = Red5.getConnectionLocal();
        IServiceCapableConnection service = (IServiceCapableConnection) conn;
        return true;
    }

    @Override
    public void appLeave( IClient client, IScope scope ) {
        IConnection conn = Red5.getConnectionLocal();
        log.debug( "Red5SIP Client leaving app " + client.getId() );

        if ( userNames.containsKey( client.getId() ) ) {
        	log.debug( "Red5SIP Client closing client " + userNames.get( client.getId() ) );
            sipManager.closeSIPUser( userNames.get( client.getId() ) );
            userNames.remove( client.getId() );
        }
    }

    public List< String > getStreams() {
        IConnection conn = Red5.getConnectionLocal();
        return getBroadcastStreamNames( conn.getScope() );
    }

    public void onPing() {
    	log.debug( "Red5SIP Ping" );
    }
	
	public void open(String uid, String username) {
		log.debug("Red5SIP open");
		login(uid, username);
		register(uid);
	}


	public void login(String uid, String username) {
		log.debug("Red5SIP login " + uid);

		IConnection conn = Red5.getConnectionLocal();
		IServiceCapableConnection service = (IServiceCapableConnection) conn;

		User sipUser = sipManager.getSIPUser(uid);

		if(sipUser == null) {
			log.debug("Red5SIP open creating sipUser for " + username + " on sip port " + sipPort + " audio port " + rtpPort + " uid " + uid );

			try {
				sipUser = new User(conn.getClient().getId(), service, sipPort, rtpPort);
				sipManager.addSIPUser(uid, sipUser);

			} catch (Exception e) {
				log.debug("open error " + e);
			}
		}

		/*
		 * Let's tie this users account to the RTPPort. This allows us to dynamically
		 * register a user when he/she joins the conference.
		 */
		String password = "secret";
		String realm = asteriskHost;
		String proxy = realm;
		//SipUser will connect to "outbound-proxy", just pass-in the proxy for it.
		sipUser.login(proxy, new Integer(rtpPort).toString(),username, password, realm, proxy);
		
		userNames.put(conn.getClient().getId(), uid);

		sipPort++;
		if (sipPort > stopSIPPort) sipPort = startSIPPort;

		rtpPort++;
		if (rtpPort > stopRTPPort) rtpPort = startRTPPort;
	}

	public void register(String uid) {
		log.debug("Red5SIP register");

		User sipUser = sipManager.getSIPUser(uid);

		if(sipUser != null) {
			sipUser.register();
		}
	}


	public void call(String uid, String destination) {
		log.debug("Red5SIP Call " + destination);

		User sipUser = sipManager.getSIPUser(uid);

		if(sipUser != null) {
			String extension = callExtensionPattern.format(new String[] { destination });
			log.debug("Red5SIP Call found user " + uid + " making call to " + extension + " (dest was: " + destination + ")");
			sipUser.call(extension);
		}

	}

	public void dtmf(String uid, String digits) {
		log.debug("Red5SIP DTMF " + digits);

		User sipUser = sipManager.getSIPUser(uid);

		if(sipUser != null) {
			log.debug("Red5SIP DTMF found user " + uid + " sending dtmf digits " + digits);
			sipUser.dtmf(digits);
		}

	}

	public void accept(String uid) {
		log.debug("Red5SIP Accept");

		User sipUser = sipManager.getSIPUser(uid);

		if(sipUser != null) {
			sipUser.accept();
		}
	}
	//Lior Add

	public void unregister(String uid) {
		log.debug("Red5SIP unregister");

			User sipUser = sipManager.getSIPUser(uid);

			if(sipUser != null) {
				sipUser.unregister();
			}
	}

	public void hangup(String uid) {
		log.debug("Red5SIP Hangup");

		User sipUser = sipManager.getSIPUser(uid);

		if(sipUser != null) {
			sipUser.hangup();
		}
	}

	public void streamStatus(String uid, String status) {
		log.debug("Red5SIP streamStatus");

		User sipUser = sipManager.getSIPUser(uid);

		if(sipUser != null) {
			sipUser.streamStatus(status);
		}
	}

	public void close(String uid) {
		log.debug("Red5SIP endRegister");

		IConnection conn = Red5.getConnectionLocal();
		sipManager.closeSIPUser(uid);
		userNames.remove(conn.getClient().getId());
	}
    
    public void setAsteriskHost(String h) {
    	asteriskHost = h;
    }
    
    public void setStartSIPPort(int startSIPPort) {
		this.startSIPPort = startSIPPort;
	}

	public void setStopSIPPort(int stopSIPPort) {
		this.stopSIPPort = stopSIPPort;
	}

	public void setStartRTPPort(int startRTPPort) {
		this.startRTPPort = startRTPPort;
	}

	public void setStopRTPPort(int stopRTPPort) {
		this.stopRTPPort = stopRTPPort;
	}
	
	public void setCallExtensionPattern(String callExtensionPattern) {
		this.callExtensionPattern = new MessageFormat(callExtensionPattern);
	}
}
