package org.bigbluebutton.deskshare.client;

public interface ScreenSharer {	
	void start();	
	void stop();
	void addClientListener(ClientListener l);
}
