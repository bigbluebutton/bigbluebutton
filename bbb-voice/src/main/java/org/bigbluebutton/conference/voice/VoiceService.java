package org.bigbluebutton.conference.voice;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.red5.app.sip.SIPManager;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.red5.server.api.service.IServiceCapableConnection;
import org.red5.server.webapp.sip.SIPUser;


public class VoiceService {

    protected static Logger log = Red5LoggerFactory.getLogger( VoiceService.class, "sip" );

    private SIPManager sipManager;
    private boolean available = false;
    private String asteriskHost;
    private int startSIPPort = 5070;
    private int stopSIPPort = 5099;
    private int sipPort;
    private int startRTPPort = 3000;
    private int stopRTPPort = 3029;
    private int rtpPort;
    private Map< String, String > userNames = new HashMap< String, String >();


/*****************************************************/	
    
	public void open(String uid, String phone,String username, String password, String realm, String proxy) {
		log.debug("Red5SIP open");

		login(uid, phone, username, password, realm, proxy);
		register(uid);
	}


	public void login(String uid, String phone, String username, String password, String realm, String proxy) {
		log.debug("Red5SIP login " + uid);

		IConnection conn = Red5.getConnectionLocal();
		IServiceCapableConnection service = (IServiceCapableConnection) conn;

		SIPUser sipUser = sipManager.getSIPUser(uid);

		if(sipUser == null) {
			log.debug("Red5SIP open creating sipUser for " + username + " on sip port " + sipPort + " audio port " + rtpPort + " uid " + uid );

			try {
				sipUser = new SIPUser(conn.getClient().getId(), service, sipPort, rtpPort);
				sipManager.addSIPUser(uid, sipUser);

			} catch (Exception e) {
				log.error("open error " + e);
			}
		}

		sipUser.login(proxy, phone,username, password, realm, proxy);
		userNames.put(conn.getClient().getId(), uid);

		sipPort++;
		if (sipPort > stopSIPPort) sipPort = startSIPPort;

		rtpPort++;
		if (rtpPort > stopRTPPort) rtpPort = startRTPPort;

	}

/*****************************************************/	
	
	public void open(String uid, String username) {
		log.debug("Red5SIP open");
		login(uid, username);
		register(uid);
	}


	public void login(String uid, String username) {
		log.debug("Red5SIP login " + uid);

		IConnection conn = Red5.getConnectionLocal();
		IServiceCapableConnection service = (IServiceCapableConnection) conn;

		SIPUser sipUser = sipManager.getSIPUser(uid);

		if(sipUser == null) {
			log.debug("Red5SIP open creating sipUser for " + username + " on sip port " + sipPort + " audio port " + rtpPort + " uid " + uid );

			try {
				sipUser = new SIPUser(conn.getClient().getId(), service, sipPort, rtpPort);
				sipManager.addSIPUser(uid, sipUser);

			} catch (Exception e) {
				log.error("open error " + e);
			}
		}

		/*
		 * Let's tie this users account to the RTPPort. This allows us to dynamically
		 * register a user when he/she joins the conference.
		 */
		String password = "secret";
		String realm = asteriskHost;
		String proxy = realm;
		sipUser.login(proxy, new Integer(rtpPort).toString(),username, password, realm, proxy);
		
		userNames.put(conn.getClient().getId(), uid);

		sipPort++;
		if (sipPort > stopSIPPort) sipPort = startSIPPort;

		rtpPort++;
		if (rtpPort > stopRTPPort) rtpPort = startRTPPort;

	}



	public void register(String uid) {
		log.debug("Red5SIP register");

		SIPUser sipUser = sipManager.getSIPUser(uid);

		if(sipUser != null) {
			sipUser.register();
		}
	}


	public void call(String uid, String destination) {
		log.debug("Red5SIP Call " + destination);

		SIPUser sipUser = sipManager.getSIPUser(uid);

		if(sipUser != null) {
			log.debug("Red5SIP Call found user " + uid + " making call to " + destination);
			sipUser.call(destination);
		}

	}

	public void dtmf(String uid, String digits) {
		log.debug("Red5SIP DTMF " + digits);

		SIPUser sipUser = sipManager.getSIPUser(uid);

		if(sipUser != null) {
			log.debug("Red5SIP DTMF found user " + uid + " sending dtmf digits " + digits);
			sipUser.dtmf(digits);
		}

	}

	public void accept(String uid) {
		log.debug("Red5SIP Accept");

		SIPUser sipUser = sipManager.getSIPUser(uid);

		if(sipUser != null) {
			sipUser.accept();
		}
	}
	//Lior Add

	public void unregister(String uid) {
		log.debug("Red5SIP unregister");

			SIPUser sipUser = sipManager.getSIPUser(uid);

			if(sipUser != null) {
				sipUser.unregister();
			}
	}

	public void hangup(String uid) {
		log.debug("Red5SIP Hangup");

		SIPUser sipUser = sipManager.getSIPUser(uid);

		if(sipUser != null) {
			sipUser.hangup();
		}
	}

	public void streamStatus(String uid, String status) {
		log.debug("Red5SIP streamStatus");

		SIPUser sipUser = sipManager.getSIPUser(uid);

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

}
