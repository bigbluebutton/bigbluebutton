package org.bigbluebutton.voiceconf.sip;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class VoiceConfToListenOnlyUsersMap {
	private Map<String, ListenOnlyUser> listenOnlyUsers = new ConcurrentHashMap<String, ListenOnlyUser>();
	
	public final String voiceConf;
	
	public VoiceConfToListenOnlyUsersMap(String voiceConf) {
	  this.voiceConf = voiceConf;	
	}
	
	public void addUser(String clientId, String callerIdName) {
		listenOnlyUsers.put(clientId, new ListenOnlyUser(clientId, callerIdName, voiceConf));
	}
	
	public ListenOnlyUser removeUser(String clientId) {
		return listenOnlyUsers.remove(clientId);
	}
	
	public int numUsers() {
		return listenOnlyUsers.size();
	}

	public Collection<ListenOnlyUser> getAllListenOnlyUsers() {
		return listenOnlyUsers.values();
	}
}
