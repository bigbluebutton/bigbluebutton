package org.red5.server.webapp.sip;

import java.text.MessageFormat;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.red5.app.sip.ConnectionClientMethodInvoker;
import org.red5.app.sip.SipUserManager;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.adapter.MultiThreadedApplicationAdapter;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.red5.server.api.scope.IScope;
import org.red5.server.api.service.IServiceCapableConnection;
import org.red5.server.api.stream.IBroadcastStream;

public class VoiceConferenceApplication extends MultiThreadedApplicationAdapter {
    private static Logger log = Red5LoggerFactory.getLogger(VoiceConferenceApplication.class, "sip");

    private SipUserManager sipManager;
    private String asteriskHost;
    private int startSIPPort = 5070;
    private int stopSIPPort = 5099;
    private int sipPort;
    private int startRTPPort = 3000;
	private int stopRTPPort = 3029;
	private int rtpPort;
	private String password = "secret";
	
	private MessageFormat callExtensionPattern = new MessageFormat("{0}");
    
    @Override
    public boolean appStart(IScope scope) {
    	log.debug("VoiceConferenceApplication appStart[" + scope.getName() + "]");
        sipPort = startSIPPort;
        rtpPort = startRTPPort;
        return true;
    }

    @Override
    public void appStop(IScope scope) {
        log.debug("VoiceConferenceApplication appStop[" + scope.getName() + "]");
        sipManager.destroyAllSessions();
    }

    @Override
    public boolean appConnect(IConnection conn, Object[] params) {
        IServiceCapableConnection service = (IServiceCapableConnection) conn;
        log.debug("VoiceConferenceApplication appConnect[" + conn.getClient().getId() + "," + service + "]");
        return true;
    }

    @Override
    public boolean appJoin(IClient client, IScope scope) {
        log.debug("VoiceConferenceApplication appJoin[" + client.getId() + "]");
        return true;
    }

    @Override
    public void appLeave(IClient client, IScope scope) {
        log.debug("VoiceConferenceApplication appLeave[" + client.getId() + "]");
        String userid = getSipUserId();

        log.debug( "Red5SIP Client closing client " +userid );
        sipManager.close(userid);
    }

    @Override
    public void streamPublishStart(IBroadcastStream stream) {
    	log.debug("streamPublishStart: {}; {}", stream, stream.getPublishedName());
    	System.out.println("streamPublishStart: " + stream.getPublishedName());
    	super.streamPublishStart(stream);
    	String userid = getSipUserId();
    	sipManager.startTalkStream(userid, stream, Red5.getConnectionLocal().getScope());
    }
    
    @Override
    public void streamBroadcastClose(IBroadcastStream stream) {
    	System.out.println("streamBroadcastClose: " + stream.getPublishedName());
    	String userid = getSipUserId();
    	sipManager.stopTalkStream(userid, stream, Red5.getConnectionLocal().getScope());
    	super.streamBroadcastClose(stream);
    }
    
    public Set<String> getStreams() {
        IConnection conn = Red5.getConnectionLocal();
        return getBroadcastStreamNames( conn.getScope() );
    }

    public void onPing() {
    	log.debug( "Red5SIP Ping" );
    }
	
/******************************************************************/
	public void open(String obproxy,String uid, String phone,
			String username, String password, String realm, String proxy) {
		System.out.println("Red5SIP open");

		login(obproxy, uid, phone, username, password, realm, proxy);
		register(uid);
	}

	public void login(String obproxy, String uid, String phone, 
			String username, String password, String realm, String proxy) {
		System.out.println("Red5SIP login " + uid);
		
		int rport = getRtpPort();
		int sport = getSipPort();
		login(proxy, uid, new Integer(rtpPort).toString(), username, password, realm, proxy, sport, rport);
	}

/******************************************************************/
	
	private synchronized int getRtpPort() {
		int rtpport = rtpPort;
		rtpPort++;
		if (rtpPort > stopRTPPort) rtpPort = startRTPPort;
		return rtpport;
	}
	
	private synchronized int getSipPort() {
		int sipport = sipPort;
		sipPort++;
		if (sipPort > stopSIPPort) sipPort = startSIPPort;
		return sipport;
	}
	
	public void open(String uid, String username) {
		log.debug("Red5SIP open");
		login(uid, username);
		register(uid);
	}

	public void login(String userid, String username) {
		log.debug("Red5SIP login " + userid);
				
		/*
		 * Let's tie this users account to the RTPPort. This allows us to dynamically
		 * register a user when he/she joins the conference.
		 */
		
		String realm =  asteriskHost; //asteriskHost; "192.168.0.120";
		String proxy = realm;
		int rport = getRtpPort();
		int sport = getSipPort();
		log.debug("Logging in as [" + rport + "," + sport + "]");
		//SipUser will connect to "outbound-proxy", just pass-in the proxy for it.
		login(proxy, userid, new Integer(rport).toString(), username, password, realm, proxy, sport, rport);
	}

	private void login(String obproxy, String uid, String phone, String username, 
			String password, String realm, String proxy, int sipport, int rtpport) {
		System.out.println("Red5SIP login " + uid);
		IConnection conn = Red5.getConnectionLocal();
		IServiceCapableConnection service = (IServiceCapableConnection) conn;
		
		ConnectionClientMethodInvoker rtmpConnection = new ConnectionClientMethodInvoker(service, conn.getScope());
		String userid = getSipUserId();
		sipManager.createSipUser(userid, rtmpConnection, sipport, rtpport);
		sipManager.login(userid, obproxy, phone, username, password, realm, proxy);
	}
	
	public void register(String uid) {
		log.debug("Red5SIP register");
		String userid = getSipUserId();
		sipManager.registerSipUser(userid);
	}

	public void call(String uid, String destination) {
		//destination = "600";
		log.debug("Red5SIP Call " + destination);
		System.out.println("Red5SIP Call " + destination);
		String userid = getSipUserId();
		String extension = callExtensionPattern.format(new String[] { destination });
		sipManager.call(userid, extension);
	}

	public void dtmf(String uid, String digits) {
		log.debug("Red5SIP DTMF " + digits);
		String userid = getSipUserId();
		sipManager.passDtmf(userid, digits);
	}

	public void accept(String uid) {
		log.debug("Red5SIP Accept");
		String userid = getSipUserId();
		sipManager.accept(userid);
	}
	
	public void unregister(String uid) {
		log.debug("Red5SIP unregister");
		String userid = getSipUserId();
		sipManager.unregister(userid);
	}

	public void hangup(String uid) {
		log.debug("Red5SIP Hangup");
		String userid = getSipUserId();
		sipManager.hangup(userid);
	}
/*
	public void streamStatus(String uid, String status) {
		log.debug("Red5SIP streamStatus");
		String userid = getSipUserId();
		sipManager.streamStatus(userid, status);
	}
*/
	public void close(String uid) {
		log.debug("Red5SIP endRegister");
		String userid = getSipUserId();
		sipManager.close(userid);
	}
    
	private String getSipUserId() {
		IConnection conn = Red5.getConnectionLocal();
		return conn.getClient().getId();
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
	
	public void setSipUserManager(SipUserManager sum) {
		sipManager = sum;
	}
}
