package org.bigbluebutton.deskshare.server;

import java.awt.Point;
import java.util.ArrayList;

public interface DeskshareClient {
	public void sendDeskshareStreamStopped(ArrayList<Object> msg);
	
	public void sendDeskshareStreamStarted(int width, int height);
	
	public void sendMouseLocation(Point mouseLoc);
}
