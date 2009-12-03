package org.bigbluebutton.webconference.voice.asterisk.meetme;

import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;

import org.asteriskjava.live.MeetMeUser;
import org.asteriskjava.live.MeetMeUserState;
import org.bigbluebutton.webconference.voice.ConferenceListener;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class UserStateChangeListener implements PropertyChangeListener {
	private static Logger log = Red5LoggerFactory.getLogger(UserStateChangeListener.class, "bigbluebutton");
	
	private ConferenceListener conferenceListener;
	
	@Override
	public void propertyChange(PropertyChangeEvent evt) {
		MeetMeUser changedUser = (MeetMeUser) evt.getSource();
		
		log.debug("Received property changed event for " + evt.getPropertyName() +
				" old = '" + evt.getOldValue() + "' new = '" + evt.getNewValue() +
				"' room = '" + ((MeetMeUser) evt.getSource()).getRoom() + "'");	
		
		if (evt.getPropertyName().equals("muted")) {				
			conferenceListener.muted(changedUser.getRoom().getRoomNumber(),
					changedUser.getUserNumber(), changedUser.isMuted());
		} else if (evt.getPropertyName().equals("talking")) {				
			conferenceListener.talking(changedUser.getRoom().getRoomNumber(),
					changedUser.getUserNumber(), changedUser.isTalking());
		} else if ("state".equals(evt.getPropertyName())) {
			if (MeetMeUserState.LEFT == (MeetMeUserState) evt.getNewValue()) {
				conferenceListener.left(changedUser.getRoom().getRoomNumber(), 
						changedUser.getUserNumber());
			}
		}
	}

	public void setConferenceServerListener(ConferenceListener l) {
		log.debug("setting conference listener");
		conferenceListener = l;
		log.debug("setting conference listener DONE");
	}
}
