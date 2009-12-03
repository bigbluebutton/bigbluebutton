package org.bigbluebutton.webconference.voice;

public interface Conference {
	public void start();
	public void stop();
	public void initializeRoom(String room);
	public void mute(Integer participant, String room, Boolean mute);	
	public void mute(String room, Boolean mute);
	public void kick(Integer participant, String room);
	public void kick(String room);
}
