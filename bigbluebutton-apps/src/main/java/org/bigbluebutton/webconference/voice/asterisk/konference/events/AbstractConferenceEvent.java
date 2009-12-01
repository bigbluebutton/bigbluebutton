package org.bigbluebutton.webconference.voice.asterisk.konference.events;

import org.asteriskjava.manager.event.ManagerEvent;

public abstract class AbstractConferenceEvent extends ManagerEvent {
	private static final long serialVersionUID = 4049251911383919117L;
	private String channel;
    private String conferenceName;

	protected AbstractConferenceEvent(Object source) {
        super(source);
    }
	
    public String getConferenceName() {
		return conferenceName;
	}

	public void setConferenceName(String conferenceName) {
		this.conferenceName = conferenceName;
	}

    public String getChannel() {
        return channel;
    }

    public void setChannel(String channel) {
        this.channel = channel;
    }

}
