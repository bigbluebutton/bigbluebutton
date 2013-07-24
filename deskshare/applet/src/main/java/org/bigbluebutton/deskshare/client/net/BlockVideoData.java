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
package org.bigbluebutton.deskshare.client.net;

public class BlockVideoData {

	private final String room;
	private final byte[] videoData;
	private final boolean keyFrame;
	private final int position;
	private final long timestamp;
	
	public BlockVideoData(String room, int position, byte[] videoData, boolean keyFrame) {
		this.room = room;
		this.position = position;
		this.videoData = videoData;
		this.keyFrame = keyFrame;
		timestamp = System.currentTimeMillis();
	}
	
	public String getRoom() {
		return room;
	}

	public int getPosition() {
		return position;
	}
	
	public byte[] getVideoData() {
		return videoData;
	}

	public boolean isKeyFrame() {
		return keyFrame;
	}	
	
	public long getTimestamp() {
		return timestamp;
	}
}
