package org.bigbluebutton.webconference.voice.asterisk.konference;

import org.bigbluebutton.webconference.voice.asterisk.konference.events.KonferenceEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceJoinEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceLeaveEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceMemberMuteEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceMemberUnmuteEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceStateEvent;
import org.bigbluebutton.webconference.voice.events.ConferenceEventListener;
import org.bigbluebutton.webconference.voice.events.ParticipantJoinedEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantLeftEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantMutedEvent;
import org.bigbluebutton.webconference.voice.events.ParticipantTalkingEvent;

/**
 * This class transforms AppKonference events into BigBlueButton Voice
 * Conference Events.
 * 
 * @author Richard Alam
 *
 */
public class KonferenceEventsTransformer {
	
	private ConferenceEventListener conferenceEventListener;
	
	/*
	 * Transforms AppKonferenceEvents into BBB Voice Conference Events.
	 * Return UnknownConferenceEvent if unable to transform the event.
	 */
	public void transform(KonferenceEvent event) {		
		if (event instanceof ConferenceJoinEvent) {
			ConferenceJoinEvent cj = (ConferenceJoinEvent) event;
			ParticipantJoinedEvent pj = new ParticipantJoinedEvent(cj.getMember(), cj.getConferenceName(),
					cj.getCallerID(), cj.getCallerIDName(), cj.getMuted(), cj.getSpeaking());
			conferenceEventListener.handleConferenceEvent(pj);
		} else if (event instanceof ConferenceLeaveEvent) {
			ConferenceLeaveEvent cl = (ConferenceLeaveEvent) event;
			ParticipantLeftEvent pl = new ParticipantLeftEvent(cl.getMember(), cl.getConferenceName());
			conferenceEventListener.handleConferenceEvent(pl);
		} else if (event instanceof ConferenceMemberMuteEvent) {
			ConferenceMemberMuteEvent cmm = (ConferenceMemberMuteEvent) event;
			ParticipantMutedEvent pm = new ParticipantMutedEvent(cmm.getMemberId(), cmm.getConferenceName(), true);
			conferenceEventListener.handleConferenceEvent(pm);
		} else if (event instanceof ConferenceMemberUnmuteEvent) {
			ConferenceMemberUnmuteEvent cmu = (ConferenceMemberUnmuteEvent) event;
			ParticipantMutedEvent pm = new ParticipantMutedEvent(cmu.getMemberId(), cmu.getConferenceName(), false);
			conferenceEventListener.handleConferenceEvent(pm);
		} else if (event instanceof ConferenceStateEvent) {
			ConferenceStateEvent cse = (ConferenceStateEvent) event;
			boolean talking = "speaking".equals(cse.getState())? true : false;
			ParticipantTalkingEvent pt = new ParticipantTalkingEvent(cse.getMemberId(), cse.getConferenceName(), talking);
			conferenceEventListener.handleConferenceEvent(pt);
		}
	}

	public void setConferenceEventListener(ConferenceEventListener listener) {
		this.conferenceEventListener = listener;
	}
}
