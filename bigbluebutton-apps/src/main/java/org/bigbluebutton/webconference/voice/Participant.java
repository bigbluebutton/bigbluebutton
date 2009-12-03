package org.bigbluebutton.webconference.voice;

public interface Participant {
	public boolean isMuted();
	public boolean isTalking();
	public int getId();
	public String getName();
}
