
package org.bigbluebutton.conference.service.voice.asterisk

import org.bigbluebutton.conference.service.voice.IVoiceServer
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.asteriskjava.live.AsteriskServer
import org.asteriskjava.live.AsteriskServerListener
import org.asteriskjava.live.DefaultAsteriskServer
import org.asteriskjava.live.ManagerCommunicationException
import org.asteriskjava.manager.ManagerConnectionimport org.asteriskjava.manager.AuthenticationFailedException
import org.asteriskjava.manager.ManagerConnection
import org.asteriskjava.manager.TimeoutException
import org.asteriskjava.live.AbstractAsteriskServerListener
import org.asteriskjava.live.MeetMeUser
import java.beans.PropertyChangeEvent
import java.beans.PropertyChangeListener
import org.asteriskjava.live.MeetMeUser
import org.asteriskjava.live.MeetMeUserState
import org.asteriskjava.live.MeetMeRoomimport org.bigbluebutton.conference.service.voice.IConferenceServerListener
public class AsteriskVoiceServer extends AbstractAsteriskServerListener implements IVoiceServer, PropertyChangeListener{
	protected static Logger log = LoggerFactory.getLogger( AsteriskVoiceServer.class )

	private ManagerConnection managerConnection;	
	private AsteriskServer asteriskServer = new DefaultAsteriskServer();
	private IConferenceServerListener conferenceServerListener
	
	/**
	 * This sends pings to our Asterisk server so Asterisk won't close the connection if there
	 * is no traffic.
	 */
	private PingThread pingThread;
	private boolean waitForMessage = true;
	def amiThread
	
	def start(){
		amiThread = new Thread() {
	        log.info("Staring AMI Asterisk service...");
	        
			try {
				log.debug("Logging at " + managerConnection.getHostname() + ":" + 
						managerConnection.getPort())
				
				managerConnection.login()
				((DefaultAsteriskServer)asteriskServer).setManagerConnection(managerConnection)	
				asteriskServer.addAsteriskServerListener(this)
				((DefaultAsteriskServer)asteriskServer).initialize()
				
				pingThread = new PingThread(managerConnection)
				pingThread.setTimeout(40000)
				pingThread.start()
			} catch (IOException e) {
				log.error("IOException while connecting to Asterisk server.")
			} catch (TimeoutException e) {
				log.error("TimeoutException while connecting to Asterisk server.")
			} catch (AuthenticationFailedException e) {
				log.error("AuthenticationFailedException while connecting to Asterisk server.")
			} catch (ManagerCommunicationException e) {
				log.error(e.printStackTrace())
			}
		}
		amiThread.start()
	}
	

	def stop(){
		try {
			pingThread.die()
			managerConnection.logoff()
		} catch (IllegalStateException e) {
			log.error("Logging off when Asterisk Server is not connected.")
		} finally {
			amiThread.stop()
		}
	}
	
	def mute(user, conference, mute) {
		log.debug("mute: $user $conference $mute")
		MeetMeRoom room = asteriskServer.getMeetMeRoom(conference)
		Collection<MeetMeUser> users = room.getUsers()
		
		for (Iterator it = users.iterator(); it.hasNext();) {
    		MeetMeUser muser = (MeetMeUser) it.next();
    		if (user == muser.getUserNumber()) {
    			if (mute) {
    				muser.mute()
    			} else {
    				muser.unmute()
    			}
    		}
    	}
	}
	
	def kick(user, conference) {
		log.debug("Kick: $user $conference")
		MeetMeRoom room = asteriskServer.getMeetMeRoom(conference)
		Collection<MeetMeUser> users = room.getUsers()
		
		for (Iterator it = users.iterator(); it.hasNext();) {
    		MeetMeUser muser = (MeetMeUser) it.next();
    		if (user == muser.getUserNumber()) {
    			muser.kick()
    		}
    	}
	}
	
	def mute(conference, mute) {
		log.debug("Mute: $conference $mute")
		MeetMeRoom room = asteriskServer.getMeetMeRoom(conference)
		Collection<MeetMeUser> users = room.getUsers()
		
		for (Iterator it = users.iterator(); it.hasNext();) {
    		MeetMeUser muser = (MeetMeUser) it.next();    		
    		if (mute) {
    			muser.mute()
    		} else {
    			muser.unmute()
    		}
    	}
	}
	
	def kick(conference){
		log.debug("Kick: $conference")
		MeetMeRoom room = asteriskServer.getMeetMeRoom(conference)
		Collection<MeetMeUser> users = room.getUsers()
		
		for (Iterator it = users.iterator(); it.hasNext();) {
    		MeetMeUser muser = (MeetMeUser) it.next();    		
    		muser.kick()
    	}
	}
	
	def initializeRoom(conference){
		log.debug("initialize $conference")
		MeetMeRoom room = asteriskServer.getMeetMeRoom(conference)
		if (room.empty) {
			log.debug("$conference is empty.")
			return
		}
		
		Collection<MeetMeUser> users = room.getUsers()
		
		for (Iterator it = users.iterator(); it.hasNext();) {
    		MeetMeUser muser = (MeetMeUser) it.next();    		
    		newUserJoined(muser)
    	}
	}
	
    public void onNewMeetMeUser(MeetMeUser user)
    {
		log.info("New user joined meetme room: " + user.getRoom() + 
				" " + user.getChannel().getCallerId().getName());
		// add a listener for changes to this user
		user.addPropertyChangeListener(this)
		newUserJoined(user)
    }
    
    private newUserJoined(MeetMeUser user) {	
		String room = user.getRoom().getRoomNumber();
		String userid = user.getUserNumber().toString()
		String username = user.getChannel().callerId.name
		Boolean muted = user.isMuted()
		Boolean talking = user.isTalking()
		conferenceServerListener.joined(room, userid, username, muted, talking)
    }
    
	public void propertyChange(PropertyChangeEvent evt) {
		MeetMeUser changedUser = (MeetMeUser) evt.getSource();
	
		log.debug("Received property changed event for " + evt.getPropertyName() +
				" old = '" + evt.getOldValue() + "' new = '" + evt.getNewValue() +
				"' room = '" + ((MeetMeUser) evt.getSource()).getRoom() + "'");	
		
		if (evt.getPropertyName().equals("muted")) {				
			conferenceServerListener.mute(changedUser.userNumber.toString(), changedUser.room.roomNumber, changedUser.muted)
		} else if (evt.getPropertyName().equals("talking")) {				
			conferenceServerListener.talk(changedUser.userNumber.toString(), changedUser.room.roomNumber, changedUser.talking)
		} else if ("state".equals(evt.getPropertyName())) {
			if (MeetMeUserState.LEFT == (MeetMeUserState) evt.getNewValue()) {
				conferenceServerListener.left(changedUser.room.roomNumber, changedUser.userNumber)
			}
		}			
	}    
	
	public void setManagerConnection(ManagerConnection connection) {
		log.debug('setting manager connection')
		this.managerConnection = connection
		log.debug('setting manager connection DONE')
	}
	
	public void setConferenceServerListener(IConferenceServerListener l) {
		log.debug('setting conference listener')
		conferenceServerListener = l
		log.debug('setting conference listener DONE')
	}
}
