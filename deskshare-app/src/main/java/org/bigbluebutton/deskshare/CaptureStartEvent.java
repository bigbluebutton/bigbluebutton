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

public class CaptureStartEvent implements ICaptureEvent {

	private final int width;
	private final int height;
	private final int frameRate;
	private final String room;
	
	public CaptureStartEvent(String room, int width, int height, int frameRate) {
		this.room = room;
		this.width = width;
		this.height = height;
		this.frameRate = frameRate;
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

	public String getRoom() {
		return room;
	}

	@Override
	public CaptureMessage getMessageType() {
		return CaptureMessage.CAPTURE_START;
	}

}
