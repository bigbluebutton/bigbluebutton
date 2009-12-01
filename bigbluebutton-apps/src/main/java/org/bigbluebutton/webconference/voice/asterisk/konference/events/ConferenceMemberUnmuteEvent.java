package org.bigbluebutton.webconference.voice.asterisk.konference.events;

public class ConferenceMemberUnmuteEvent extends AbstractConferenceEvent {

	private Integer memberId;
	
	public ConferenceMemberUnmuteEvent(Object source) {
        super(source);
    }

	public Integer getMemberId() {
		return memberId;
	}

	public void setMemberId(Integer memberId) {
		this.memberId = memberId;
	}
}
