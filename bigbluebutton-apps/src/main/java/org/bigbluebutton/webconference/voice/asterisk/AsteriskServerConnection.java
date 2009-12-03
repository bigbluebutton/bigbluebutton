package org.bigbluebutton.webconference.voice.asterisk;

import org.asteriskjava.manager.ManagerConnection;

public class AsteriskServerConnection {

	private ManagerConnection connection;
	
	public AsteriskServerConnection(ManagerConnection connection) {
		this.connection = connection;
	}
	
}
