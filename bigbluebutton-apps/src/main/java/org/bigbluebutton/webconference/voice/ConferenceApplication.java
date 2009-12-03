package org.bigbluebutton.webconference.voice;

public interface ConferenceApplication {
	public void startup();
	public void shutdown();
	public void populateRoom(String room);
	public void mute(String room, Integer participant, Boolean mute);	
	public void eject(String room, Integer participant);
}
