package org.bigbluebutton.deskshare;

import java.awt.image.BufferedImage;

public class CapturedScreen {

	private BufferedImage screen;
	private String room;
	
	private int width;
	private int height;
	private int frameRate;	
	
	public void setScreen(BufferedImage screen) {
		this.screen = screen;
	}

	public void setRoom(String room) {
		this.room = room;
	}

	public void setWidth(int width) {
		this.width = width;
	}

	public void setHeight(int height) {
		this.height = height;
	}

	public void setFrameRate(int frameRate) {
		this.frameRate = frameRate;
	}
	
	public BufferedImage getScreen() {
		return screen;
	}

	public String getRoom() {
		return room;
	}

	public int getWidth() {
		return width;
	}

	public int getHeight() {
		return height;
	}

	public int getFrameRate() {
		return frameRate;
	}


}
