package org.bigbluebutton.deskshare;

import java.awt.image.BufferedImage;

public class CapturedScreen {

	private BufferedImage screen;
	private String room;
	
	private int width;
	private int height;
	private int frameRate;
	
	public CapturedScreen(BufferedImage screen, String room, int width,
			int height, int frameRate) {
		super();
		this.screen = screen;
		this.room = room;
		this.width = width;
		this.height = height;
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
