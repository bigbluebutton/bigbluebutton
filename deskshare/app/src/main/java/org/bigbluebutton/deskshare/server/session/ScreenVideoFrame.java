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
package org.bigbluebutton.deskshare.server.session;

import java.io.ByteArrayOutputStream;

import org.apache.mina.core.buffer.IoBuffer;

public class ScreenVideoFrame {

	private final String room;
	private final ByteArrayOutputStream encodedData;
	
	public ScreenVideoFrame(String room, ByteArrayOutputStream encodedData) {
		this.room = room;
		this.encodedData = encodedData;
	}
	
	public String getRoom() {
		return room;
	}
	
	public IoBuffer getVideoData() {
		byte[] data = (byte[]) encodedData.toByteArray();
		
		IoBuffer buffer = IoBuffer.allocate(data.length, false);
		buffer.put(data);
		
		/* Set the marker back to zero position so that "gets" start from the beginning.
		 * Otherwise, you get BufferUnderFlowException.
		 */		
		buffer.rewind();	
		return buffer;
	}

}
