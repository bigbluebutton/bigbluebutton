package org.bigbluebutton.webconference.voice;

public interface ConferenceListener {
	public void joined(String room, Integer participant, String name, Boolean muted, Boolean talking);
	public void left(String room, Integer participant);
	public void muted(String room, Integer participant, Boolean muted);
	public void talking(String room, Integer participant, Boolean talking);	
}
