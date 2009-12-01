package org.bigbluebutton.webconference.voice.asterisk.konference.events;

public class ConferenceSoundCompleteEvent extends AbstractConferenceEvent {

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
