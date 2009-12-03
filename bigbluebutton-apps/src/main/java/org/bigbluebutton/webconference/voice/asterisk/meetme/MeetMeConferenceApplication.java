package org.bigbluebutton.webconference.voice.asterisk.meetme;

import org.slf4j.Logger;
import org.asteriskjava.live.AsteriskServer;
import org.asteriskjava.live.DefaultAsteriskServer;
import org.asteriskjava.live.ManagerCommunicationException;
import org.asteriskjava.manager.ManagerConnection;
import org.asteriskjava.live.MeetMeUser;
import java.beans.PropertyChangeListener;
import java.util.Collection;
import java.util.Iterator;

import org.asteriskjava.live.MeetMeRoom;
import org.bigbluebutton.webconference.voice.ConferenceListener;
import org.bigbluebutton.webconference.voice.asterisk.AbstractAsteriskServerListener;
import org.red5.logging.Red5LoggerFactory;
import org.asteriskjava.manager.ManagerConnectionState;

public class MeetMeConferenceApplication extends AbstractAsteriskServerListener {
	private static Logger log = Red5LoggerFactory.getLogger(MeetMeConferenceApplication.class, "bigbluebutton");

	private ManagerConnection managerConnection;	
	private AsteriskServer asteriskServer = new DefaultAsteriskServer();
	private ConferenceListener conferenceListener;
	private PropertyChangeListener userStateListener;
	
	public void initialize() {
		log.info("Staring AMI Asterisk service...");
	        
		((DefaultAsteriskServer)asteriskServer).setManagerConnection(managerConnection);
		asteriskServer.addAsteriskServerListener(this);
		((DefaultAsteriskServer)asteriskServer).initialize();				
	}
		
	public void mute(Integer user, String conference, Boolean mute) {
		log.debug("mute: $user $conference $mute");
		MeetMeRoom room = getMeetMeRoom(conference);
		
		if (room == null) return;
		
		Collection<MeetMeUser> users = room.getUsers();
		
		for (Iterator<MeetMeUser> it = users.iterator(); it.hasNext();) {
    		MeetMeUser muser = (MeetMeUser) it.next();
    		if (user == muser.getUserNumber()) {
    			if (mute) {
    				muser.mute();
    			} else {
    				muser.unmute();
    			}
    		}
    	}
	}
	
	public void kick(Integer user, String conference) {
		log.debug("Kick: $user $conference");
		MeetMeRoom room = getMeetMeRoom(conference);
		
		if (room == null) return;
		
		Collection<MeetMeUser> users = room.getUsers();
		
		for (Iterator<MeetMeUser> it = users.iterator(); it.hasNext();) {
    		MeetMeUser muser = (MeetMeUser) it.next();
    		if (user == muser.getUserNumber()) {
    			muser.kick();
    		}
    	}
	}
	
	public void mute(String conference, Boolean mute) {
		log.debug("Mute: $conference $mute");
		MeetMeRoom room = getMeetMeRoom(conference);
		
		if (room == null) return;
		
		Collection<MeetMeUser> users = room.getUsers();
		
		for (Iterator<MeetMeUser> it = users.iterator(); it.hasNext();) {
    		MeetMeUser muser = (MeetMeUser) it.next();    		
    		if (mute) {
    			muser.mute();
    		} else {
    			muser.unmute();
    		}
    	}
	}
	
	public void kick(String conference){
		log.debug("Kick: $conference");
		MeetMeRoom room = getMeetMeRoom(conference);
		
		if (room == null) return;
		
		Collection<MeetMeUser> users = room.getUsers();
		
		for (Iterator<MeetMeUser> it = users.iterator(); it.hasNext();) {
    		MeetMeUser muser = (MeetMeUser) it.next();    		
    		muser.kick();
    	}
	}
	
	public void initializeRoom(String conference){
		log.debug("initialize $conference");
		MeetMeRoom room = getMeetMeRoom(conference);
		
		if (room == null) return;
		
		if (room.isEmpty()) {
			log.debug("$conference is empty.");
			return;
		}
		
		Collection<MeetMeUser> users = room.getUsers();
		
		for (Iterator<MeetMeUser> it = users.iterator(); it.hasNext();) {
    		MeetMeUser muser = (MeetMeUser) it.next();    		
    		newUserJoined(muser);
    	}
	}
	
    public void onNewMeetMeUser(MeetMeUser user) {
		log.info("New user joined meetme room: " + user.getRoom() + 
				" " + user.getChannel().getCallerId().getName());
		// add a listener for changes to this user
		user.addPropertyChangeListener(userStateListener);
		newUserJoined(user);
    }
    
    private void newUserJoined(MeetMeUser user) {	
		String room = user.getRoom().getRoomNumber();
		Integer userid = user.getUserNumber();
		String username = user.getChannel().getCallerId().getName();
		Boolean muted = user.isMuted();
		Boolean talking = user.isTalking();
		conferenceListener.joined(room, userid, username, muted, talking);
    }
    	
	private MeetMeRoom getMeetMeRoom(String room) {
		if (managerConnection.getState() != ManagerConnectionState.CONNECTED) {
			log.error("No connection to the Asterisk server. Connection state is {}", managerConnection.getState().toString());
			return null;
		}
		try {
			MeetMeRoom mr = asteriskServer.getMeetMeRoom(room);
			return mr;
		} catch (ManagerCommunicationException e) {
			log.error("Exception error when trying to get conference ${room}");
		}
		return null;
	}
	
	public void setManagerConnection(ManagerConnection connection) {
		log.debug("setting manager connection");
		this.managerConnection = connection;
		log.debug("setting manager connection DONE");
	}
	
	public void setConferenceListener(ConferenceListener listener) {
		log.debug("setting conference listener");
		conferenceListener = listener;
		log.debug("setting conference listener DONE");
	}
	
	public void setUserStateListener(PropertyChangeListener listener) {
		userStateListener = listener;
	}
}
