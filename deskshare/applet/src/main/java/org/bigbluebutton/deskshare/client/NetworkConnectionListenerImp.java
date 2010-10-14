package org.bigbluebutton.deskshare.client;

import org.bigbluebutton.deskshare.client.net.NetworkConnectionListener;

public class NetworkConnectionListenerImp implements NetworkConnectionListener {

	private final ClientListener listener;
	
	public NetworkConnectionListenerImp(ClientListener listener) {
		this.listener = listener;
	}
	
	@Override
	public void networkConnectionException(ExitCode reason) {
		System.out.println("Notifying client of network stopping.");
		listener.onClientStop(reason);
	}

}
