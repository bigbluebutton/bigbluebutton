package org.bigbluebutton.webconference.voice.asterisk.konference.events;

public class ConferenceStateEvent extends AbstractConferenceEvent {
	
	private String flags;
	private String state;
	private Integer memberId;
	
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

	public Integer getMemberId() {
		return memberId;
	}

	public void setMemberId(Integer memberId) {
		this.memberId = memberId;
	}
}
