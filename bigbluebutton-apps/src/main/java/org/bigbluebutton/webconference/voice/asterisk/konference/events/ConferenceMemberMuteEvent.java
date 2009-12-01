package org.bigbluebutton.webconference.voice.asterisk.konference.events;

public class ConferenceMemberMuteEvent extends AbstractConferenceEvent {

	private Integer memberId;
	
	public ConferenceMemberMuteEvent(Object source) {
        super(source);
    }

	public Integer getMemberId() {
		return memberId;
	}

	public void setMemberId(Integer memberId) {
		this.memberId = memberId;
	}
}
