package org.asteriskjava.extras.appkonference.manager.event;

public class ConferenceStateEvent extends AbstractConferenceEvent {
	
	private String flags;
	private String state;
	
	public ConferenceStateEvent(Object source)
    {
        super(source);
    }

	public String getFlags() {
		return flags;
	}

	public void setFlags(String flags) {
		this.flags = flags;
	}

	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}
}
