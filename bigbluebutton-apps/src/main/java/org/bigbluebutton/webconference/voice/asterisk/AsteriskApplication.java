package org.bigbluebutton.webconference.voice.asterisk;

import java.io.IOException;

import org.asteriskjava.manager.AuthenticationFailedException;
import org.asteriskjava.manager.ManagerConnection;
import org.asteriskjava.manager.ManagerConnectionState;
import org.asteriskjava.manager.TimeoutException;
import org.bigbluebutton.webconference.voice.ConferenceApplication;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class AsteriskApplication implements ConferenceApplication {
	private static Logger log = Red5LoggerFactory.getLogger(AsteriskApplication.class, "bigbluebutton");
	
	private ConferenceApplication appDelegate;
	private KeepAlivePing ping;
	private ManagerConnection connection;
	
	@Override
	public void eject(String room, Integer participant) {
		appDelegate.eject(room, participant);
	}

	@Override
	public void mute(String room, Integer participant, Boolean mute) {
		appDelegate.mute(room, participant, mute);
	}

	@Override
	public void populateRoom(String room) {
		appDelegate.populateRoom(room);
	}

	@Override
	public void shutdown() {
		if (ping != null) {
			log.info("Stopping Keep Alive Ping");
			ping.stop();
		}
		
		if ((connection != null) && (connection.getState() == ManagerConnectionState.CONNECTED)) {
			log.info("Logging off fom [" + connection.getHostname() + ":" + connection.getPort() + "]");
			connection.logoff();
		}
		appDelegate.shutdown();
	}

	@Override
	public void startup() {
		if (connection == null) {
			log.error("Cannot start application as ManagerConnection has not been set.");
			return;
		}
		
		if (login()) {
			ping = new KeepAlivePing(connection);
			ping.start();
			appDelegate.startup();
		}
	}
	
	private boolean login() {
		log.info("Logging in as [" + connection.getUsername() + "," + connection.getPassword() +
				"] to [" + connection.getHostname() + ":" + connection.getPort() + "]");
		try {
			connection.login();
			return true;
		} catch (IllegalStateException e) {
			log.error("IllegalStateException occured on login to AMI");
		} catch (IOException e) {
			log.error("IOException occured on login to AMI");
		} catch (AuthenticationFailedException e) {
			log.error("AuthenticationFailedException occured on login to AMI");
		} catch (TimeoutException e) {
			log.error("TimeoutException occured on login to AMI");
		}
		return false;
	}

	public void setConferenceApplication(ConferenceApplication c) {
		appDelegate = c;
	}
	
	public void setManagerConnection(ManagerConnection c) {
		connection = c;
	}
}
