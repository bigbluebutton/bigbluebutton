package org.bigbluebutton.webconference.voice.asterisk.konference.events;

import org.asteriskjava.manager.event.ManagerEvent;

public class KonferenceMuteEvent extends ManagerEvent {

	private static final long serialVersionUID = 1L;

	private String conferenceName;
	
	public KonferenceMuteEvent(Object source) {
        super(source);
    }

	public String getConferenceName() {
		return conferenceName;
	}

	public void setConferenceName(String conferenceName) {
		this.conferenceName = conferenceName;
	}
}
