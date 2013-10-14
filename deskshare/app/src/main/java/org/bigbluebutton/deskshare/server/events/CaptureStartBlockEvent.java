/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.deskshare.server.events;

import org.bigbluebutton.deskshare.common.Dimension;

public class CaptureStartBlockEvent {

	private final String room;
	private final Dimension screenDim;
	private final Dimension blockDim;
	private final int sequenceNum;
	private final boolean useSVC2;
	
	public CaptureStartBlockEvent(String room, Dimension screen, Dimension block, int sequenceNum, boolean useSVC2) {
		this.room = room;
		screenDim = screen;
		blockDim = block;
		this.sequenceNum = sequenceNum;
		this.useSVC2 = useSVC2;
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
	
	public int getSequenceNum() {
		return sequenceNum;
	}

	public boolean isUseSVC2() {
		return useSVC2;
	}
}
