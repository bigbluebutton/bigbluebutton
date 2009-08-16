package org.asteriskjava.extras.appkonference.manager.event;

public class ConferenceSoundCompleteEvent extends AbstractConferenceEvent {

	private String sound;
	
	public ConferenceSoundCompleteEvent(Object source)
    {
        super(source);
    }

	public String getSound() {
		return sound;
	}

	public void setSound(String sound) {
		this.sound = sound;
	}
}
