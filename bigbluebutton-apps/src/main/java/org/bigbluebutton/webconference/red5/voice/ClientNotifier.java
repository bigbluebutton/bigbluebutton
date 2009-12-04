package org.bigbluebutton.webconference.red5.voice;

import org.bigbluebutton.webconference.voice.ConferenceServerListener;
import org.red5.server.api.so.ISharedObject;

public interface ClientNotifier extends ConferenceServerListener {

	
	public void addSharedObject(String webRoom, String voiceRoom, ISharedObject so);
	
	public void removeSharedObject(String webRoom);
		
	public void joined(String room, Integer participant, String name, Boolean muted, Boolean talking);
	
	public void left(String room, Integer participant);
	
	public void muted(String room, Integer participant, Boolean muted);
	
	public void talking(String room, Integer participant, Boolean talking);
}
