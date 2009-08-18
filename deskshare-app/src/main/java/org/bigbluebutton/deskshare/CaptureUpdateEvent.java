/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Affero General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.deskshare;

import java.awt.image.BufferedImage;

public class CaptureUpdateEvent implements ICaptureEvent {

	private final BufferedImage screen;
	private final String room;
	
	private final int width;
	private final int height;
	private final int x;
	private final int y;
	
	public CaptureUpdateEvent(BufferedImage screen, String room, int width,
			int height, int x, int y) {

		this.screen = screen;
		this.room = room;
		this.width = width;
		this.height = height;
		this.x = x;
		this.y = y;
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

	public int getX() {
		return x;
	}

	public int getY() {
		return y;
	}

	@Override
	public CaptureMessage getMessageType() {
		return CaptureMessage.CAPTURE_UPDATE;
	}
}
