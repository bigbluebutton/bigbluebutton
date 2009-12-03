package org.bigbluebutton.webconference.voice.asterisk;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import java.util.Map;
import org.bigbluebutton.conference.Participant;
import org.bigbluebutton.conference.service.voice.VoiceRoom;
import org.bigbluebutton.conference.service.voice.VoiceRoomsManager;

public class ConferenceApplication {
	private static Logger log = Red5LoggerFactory.getLogger(ConferenceApplication.class, "bigbluebutton");	
		
	private VoiceRoomsManager roomsManager;
	
	public boolean createRoom(String name) {
		roomsManager.addRoom(new VoiceRoom(name));
		return true;
	}
	
	public boolean destroyRoom(String name) {
		if (roomsManager.hasRoom(name)) {
			roomsManager.removeRoom(name);
		}
		return true;
	}
	
	public boolean hasRoom(String name) {
		return roomsManager.hasRoom(name);
	}
			
	public void joined(String room, Integer participant, String name, Boolean muted, Boolean talking){
		log.debug("joined: $room $participant $name $muted $talking");
		roomsManager.joined(room, participant, name, muted, talking);
	}
	

	public left(room, participant){
		log.debug("left: $room $participant")
		roomsManager.left(room, participant)
	}
	

	public mute(participant, room, mute){
		log.debug("mute: $participant $room $mute")
		roomsManager.mute(participant, room, mute)
	}
	
	public talk(participant, room, talk){
		log.debug("talk: $participant $room $talk")
		roomsManager.talk(participant, room, talk)
	}
	
	public participants(room) {
		log.debug("getting partiicpnats for $room")
		roomsManager.participants(room)
	}
	
	public void setRoomsManager(VoiceRoomsManager r) {
		log.debug("Setting room manager")
		roomsManager = r
	}
}
