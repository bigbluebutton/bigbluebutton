package org.bigbluebutton.deskshare.client;

public class SystemTrayListenerImp implements SystemTrayListener {

	private final ClientListener listener;
	
	public SystemTrayListenerImp(ClientListener listener) {
		this.listener = listener;
	}
	
	@Override
	public void onStopSharingSysTrayMenuClicked() {
		listener.onClientStop(ExitCode.NORMAL);
	}

}
