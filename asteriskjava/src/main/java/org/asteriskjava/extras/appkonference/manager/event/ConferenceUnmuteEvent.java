package org.asteriskjava.extras.appkonference.manager.event;

import org.asteriskjava.manager.event.ManagerEvent;

public class ConferenceUnmuteEvent extends ManagerEvent {

	private static final long serialVersionUID = 1L;

	private String conferenceName;
	
	public ConferenceUnmuteEvent(Object source)
    {
        super(source);
    }

	public String getConferenceName() {
		return conferenceName;
	}

	public void setConferenceName(String conferenceName) {
		this.conferenceName = conferenceName;
	}
}
