package org.bigbluebutton.webconference.voice.asterisk.konference.events;

public class ConferenceMemberUnmuteEvent extends KonferenceEvent {
	/*
	 * WARNING: Be careful not to rename the class as Asterisk-Java uses the class name
	 * to convert from raw AMI to Java. Therefore, when the appkonference event name
	 * changes, you should also rename this class.
	 */
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
