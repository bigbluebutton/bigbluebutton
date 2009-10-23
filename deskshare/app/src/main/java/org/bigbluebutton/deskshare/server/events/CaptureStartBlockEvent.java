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
 * Author: Richard Alam <ritzalam@gmail.com>
 *
 * $Id: $x
 */
package org.bigbluebutton.deskshare.server.events;

import org.bigbluebutton.deskshare.common.Dimension;

public class CaptureStartBlockEvent {

	private final String room;
	private final Dimension screenDim;
	private final Dimension blockDim;
	
	public CaptureStartBlockEvent(String room, Dimension screen, Dimension block) {
		this.room = room;
		screenDim = screen;
		blockDim = block;
	}
	
	public Dimension getScreenDimension() {
		return screenDim;
	}
	
	public Dimension getBlockDimension() {
		return blockDim;
	}
	
	public String getRoom() {
		return room;
	}
}
