package org.bigbluebutton.webconference.voice.asterisk.konference.events;

public class KonferenceStateEvent extends AbstractKonferenceEvent {
	
	private String flags;
	private String state;
	
	public KonferenceStateEvent(Object source)
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
