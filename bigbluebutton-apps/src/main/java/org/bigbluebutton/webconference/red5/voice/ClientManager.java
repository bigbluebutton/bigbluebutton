package org.bigbluebutton.webconference.red5.voice;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.bigbluebutton.webconference.voice.ConferenceListener;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.so.ISharedObject;
import org.slf4j.Logger;

public class ClientManager implements ConferenceListener {
	private static Logger log = Red5LoggerFactory.getLogger(ClientManager.class, "bigbluebutton");

	private final Map<String, SharedObjectInfo> voiceRooms;
	private final Map<String, SharedObjectInfo> webRooms;
	
	public ClientManager() {
		voiceRooms = new ConcurrentHashMap<String, SharedObjectInfo>();
		webRooms = new ConcurrentHashMap<String, SharedObjectInfo>();
	}
	
	public void addSharedObject(String webRoom, String voiceRoom, ISharedObject so) {
		SharedObjectInfo soi = new SharedObjectInfo(webRoom, voiceRoom, so);
		voiceRooms.put(voiceRoom, soi);
		webRooms.put(webRoom, soi);
	}
	
	public void removeSharedObject(String webRoom) {
		SharedObjectInfo soi = webRooms.remove(webRoom);
		if (soi != null) voiceRooms.remove(soi.getVoiceRoom());
	}
		
	public void joined(String room, Integer participant, String name, Boolean muted, Boolean talking){
		log.debug("Participant $name joining");
		SharedObjectInfo soi = voiceRooms.get(room);
		if (soi != null) {
			List<String> list = new ArrayList<String>();
			list.add(participant.toString());
			list.add(name);
			list.add(muted.toString());
			list.add(talking.toString());
			soi.getSharedObject().sendMessage("userJoin", list);
		}
				
	}
	
	public void left(String room, Integer participant){
		log.debug("Participant $user leaving");
		SharedObjectInfo soi = voiceRooms.get(room);
		if (soi != null) {
			List<String> list = new ArrayList<String>();
			list.add(participant.toString());
			soi.getSharedObject().sendMessage("userLeft", list);
		}
	}
	
	public void muted(String room, Integer participant, Boolean muted){
		log.debug("Participant $user mute $muted");
		SharedObjectInfo soi = voiceRooms.get(room);
		if (soi != null) {
			List<String> list = new ArrayList<String>();
			list.add(participant.toString());
			soi.getSharedObject().sendMessage("userMute", list);
		}		
	}
	
	public void talking(String room, Integer participant, Boolean talking){
		log.debug("Participant $user talk $talking");
		SharedObjectInfo soi = voiceRooms.get(room);
		if (soi != null) {
			List<String> list = new ArrayList<String>();
			list.add(participant.toString());
			soi.getSharedObject().sendMessage("userTalk", list);
		}
	}	
}
