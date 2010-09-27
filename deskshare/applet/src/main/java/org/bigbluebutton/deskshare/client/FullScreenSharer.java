package org.bigbluebutton.deskshare.client;

public class FullScreenSharer implements ScreenSharer {

	private final ScreenShareInfo ssi;
	private ScreenSharerRunner sharer;
	private ClientListener listener;
	
	public FullScreenSharer(ScreenShareInfo ssi) {
		this.ssi = ssi;
	}
	
	public void start() {
		sharer = new ScreenSharerRunner(ssi);
		sharer.addClientListener(listener);
		sharer.startSharing();
	}
	
	public void addClientListener(ClientListener l) {
		listener = l;
	}
	
	public void stop() {
		sharer.stopSharing();
	}
}
