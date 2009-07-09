package org.bigbluebutton.deskshare;

import java.awt.image.BufferedImage;

public class CaptureEvent implements ICaptureEvent {

	private CapturedScreen cs;
	
	public CaptureEvent(CapturedScreen cs) {
		this.cs = cs;
	}
	
	public String getRoom() {
		return cs.getRoom();
	}
	
	public int getWidth() {
		return cs.getWidth();
	}
	
	public int getHeight() {
		return cs.getHeight();
	}
	
	public int getFrameRate() {
		return cs.getFrameRate();
	}
	
	public BufferedImage getCapturedScreen() {
		return cs.getScreen();
	}
}
