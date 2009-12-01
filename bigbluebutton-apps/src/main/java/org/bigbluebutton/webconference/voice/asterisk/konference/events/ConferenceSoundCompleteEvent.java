package org.bigbluebutton.webconference.voice.asterisk.konference.events;

public class ConferenceSoundCompleteEvent extends KonferenceEvent {
	/*
	 * WARNING: Be careful not to rename the class as Asterisk-Java uses the class name
	 * to convert from raw AMI to Java. Therefore, when the appkonference event name
	 * changes, you should also rename this class.
	 */
	private String sound;
	private Integer memberId;
	
	public ConferenceSoundCompleteEvent(Object source) {
        super(source);
    }

	public String getSound() {
		return sound;
	}

	public void setSound(String sound) {
		this.sound = sound;
	}

	public Integer getMemberId() {
		return memberId;
	}

	public void setMemberId(Integer memberId) {
		this.memberId = memberId;
	}
}
