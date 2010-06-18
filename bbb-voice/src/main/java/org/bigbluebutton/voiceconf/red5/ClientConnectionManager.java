package org.bigbluebutton.voiceconf.red5;

import java.util.HashMap;
import java.util.Map;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.service.IServiceCapableConnection;
import org.slf4j.Logger;

public class ClientConnectionManager {
	private static Logger log = Red5LoggerFactory.getLogger(ClientConnectionManager.class, "sip");
	
	private Map<String, ClientConnection> clients = new HashMap<String, ClientConnection>();
	
	public void createClient(String id, IServiceCapableConnection connection) {
		ClientConnection cc = new ClientConnection(id, connection);
		clients.put(id, cc);
	}
	
	public void removeClient(String id) {
		ClientConnection cc = clients.remove(id);
		if (cc == null) log.warn("Failed to remove client {}.", id);
	}
	
	
}
