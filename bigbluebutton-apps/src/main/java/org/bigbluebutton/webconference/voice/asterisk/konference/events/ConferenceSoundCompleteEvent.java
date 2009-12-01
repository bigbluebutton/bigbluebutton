package org.bigbluebutton.webconference.voice.asterisk.konference.events;

public class ConferenceSoundCompleteEvent extends AbstractConferenceEvent {

	private String sound;
	
	public ConferenceSoundCompleteEvent(Object source) {
        super(source);
    }

	public String getSound() {
		return sound;
	}

	public void setSound(String sound) {
		this.sound = sound;
	}
}
