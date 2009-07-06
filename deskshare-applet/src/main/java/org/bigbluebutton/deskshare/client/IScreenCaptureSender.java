package org.bigbluebutton.deskshare.client;

import java.awt.image.BufferedImage;

public interface IScreenCaptureSender {

	public void connect(String host, String room, int videoWidth, int videoHeight, int frameRate);
	public void send(BufferedImage screenCapture);
	public void disconnect();
	
}
