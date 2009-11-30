package org.bigbluebutton.webconference.voice.asterisk.konference.events;

public class KonferenceSoundCompleteEvent extends AbstractKonferenceEvent {

	private String sound;
	
	public KonferenceSoundCompleteEvent(Object source) {
        super(source);
    }

	public String getSound() {
		return sound;
	}

	public void setSound(String sound) {
		this.sound = sound;
	}
}
