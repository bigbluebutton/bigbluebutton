package org.bigbluebutton.webconference.voice.asterisk.konference;

import org.bigbluebutton.webconference.voice.ConferenceServerListener;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceJoinEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceLeaveEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceMemberMuteEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceMemberUnmuteEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceStateEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.KonferenceEvent;

public class KonferenceEventHandler {
	
	private ConferenceServerListener listener;
	
	public void handleKonferenceEvent(KonferenceEvent event) {
		if (event instanceof ConferenceJoinEvent) {
			ConferenceJoinEvent cj = (ConferenceJoinEvent) event;
			listener.joined(cj.getConferenceName(), cj.getMember(), cj.getCallerIDName(), cj.getMuted(), cj.getSpeaking());
		} else if (event instanceof ConferenceLeaveEvent) {
			ConferenceLeaveEvent cl = (ConferenceLeaveEvent) event;
			listener.left(cl.getConferenceName(), cl.getMember());
		} else if (event instanceof ConferenceMemberMuteEvent) {
			ConferenceMemberMuteEvent cmm = (ConferenceMemberMuteEvent) event;
			listener.muted(cmm.getConferenceName(), cmm.getMemberId(), true);
		} else if (event instanceof ConferenceMemberUnmuteEvent) {
			ConferenceMemberUnmuteEvent cmu = (ConferenceMemberUnmuteEvent) event;
			listener.muted(cmu.getConferenceName(), cmu.getMemberId(), false);
		} else if (event instanceof ConferenceStateEvent) {
			ConferenceStateEvent cse = (ConferenceStateEvent) event;
			boolean talking = "speaking".equals(cse.getState())? true : false;
			listener.talking(cse.getConferenceName(), cse.getMemberId(), talking);	
		}		
	}

	public void setListener(ConferenceServerListener listener) {
		this.listener = listener;
	}
	
}
