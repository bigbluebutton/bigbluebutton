/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
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
