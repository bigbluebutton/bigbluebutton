package org.bigbluebutton.webconference.voice.asterisk.meetme;

import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;

import org.asteriskjava.live.MeetMeUser;
import org.asteriskjava.live.MeetMeUserState;
import org.bigbluebutton.webconference.voice.events.ConferenceEventListener;
import org.bigbluebutton.webconference.voice.events.ParticipantJoinedEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantLeftEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantMutedEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantTalkingEvent;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class UserStateChangeListener implements PropertyChangeListener {
	private static Logger log = Red5LoggerFactory.getLogger(UserStateChangeListener.class, "bigbluebutton");
	
	private ConferenceEventListener conferenceEventListener;
	
	@Override
	public void propertyChange(PropertyChangeEvent evt) {
		MeetMeUser cu = (MeetMeUser) evt.getSource();
		
		log.debug("Received property changed event for " + evt.getPropertyName() +
				" old = '" + evt.getOldValue() + "' new = '" + evt.getNewValue() +
				"' room = '" + ((MeetMeUser) evt.getSource()).getRoom() + "'");	
		
		if (evt.getPropertyName().equals("muted")) {	
			ParticipantMutedEvent pme = new ParticipantMutedEvent(cu.getUserNumber(), 
								cu.getRoom().getRoomNumber(), cu.isMuted());
			conferenceEventListener.handleConferenceEvent(pme);
		} else if (evt.getPropertyName().equals("talking")) {	
			ParticipantTalkingEvent pte = new ParticipantTalkingEvent(cu.getUserNumber(),
								cu.getRoom().getRoomNumber(), cu.isTalking());
			conferenceEventListener.handleConferenceEvent(pte);
		} else if ("state".equals(evt.getPropertyName())) {
			if (MeetMeUserState.LEFT == (MeetMeUserState) evt.getNewValue()) {
				ParticipantLeftEvent ple = new ParticipantLeftEvent(cu.getUserNumber(),
								cu.getRoom().getRoomNumber());
				conferenceEventListener.handleConferenceEvent(ple);
			}
		}
	}

	public void handleNewUserJoined(MeetMeUser user) {	
		String room = user.getRoom().getRoomNumber();
		Integer userid = user.getUserNumber();
		String username = user.getChannel().getCallerId().getName();
		Boolean muted = user.isMuted();
		Boolean talking = user.isTalking();
		
		ParticipantJoinedEvent pje = new ParticipantJoinedEvent(userid, 
										room, username,	username, muted, talking);
		conferenceEventListener.handleConferenceEvent(pje);
    }
	
	public void setConferenceEventListener(ConferenceEventListener l) {
		log.debug("setting conference listener");
		conferenceEventListener = l;
		log.debug("setting conference listener DONE");
	}
}
