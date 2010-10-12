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
package org.bigbluebutton.deskshare.client.net;

import java.awt.Point;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import org.bigbluebutton.deskshare.common.Dimension;

public class BlockStreamProtocolEncoder {

	private static final byte[] HEADER = new byte[] {'B', 'B', 'B', '-', 'D', 'S'}; 
    private static final byte CAPTURE_START_EVENT = 0;
    private static final byte CAPTURE_UPDATE_EVENT = 1;
    private static final byte CAPTURE_END_EVENT = 2;
    private static final byte MOUSE_LOCATION_EVENT = 3;
    
	public static void encodeStartStreamMessage(String room, Dimension screen, Dimension block,
						ByteArrayOutputStream data, int seqNum) throws IOException {	
		
		data.write(CAPTURE_START_EVENT);
		encodeRoom(data, room);
		encodeSequenceNumber(data, seqNum);
		
		data.write(intToBytes(block.getWidth()));
		data.write(intToBytes(block.getHeight()));
		data.write(intToBytes(screen.getWidth()));
		data.write(intToBytes(screen.getHeight()));
	}
	
	public static void encodeBlock(BlockVideoData block, ByteArrayOutputStream data, int seqNum) throws IOException {		
		data.write(CAPTURE_UPDATE_EVENT);
		encodeRoom(data, block.getRoom());
		
		encodeSequenceNumber(data, seqNum);
		
		byte[] position = new byte[2];
		int pos = block.getPosition();
		position[0] = (byte)((pos >> 8) & 0xff);
		position[1] = (byte)(pos & 0xff);
			
		data.write(position);
		data.write(block.isKeyFrame() ? 1:0);
			
		int length = block.getVideoData().length;			
		data.write(intToBytes(length));			
		data.write(block.getVideoData());		
	}
		
	public static byte[] encodeHeaderAndLength(ByteArrayOutputStream data) throws IOException {
		ByteArrayOutputStream header = new ByteArrayOutputStream();
		header.write(HEADER);
		header.write(intToBytes(data.size()));
		return header.toByteArray();
	}
	
	public static void encodeMouseLocation(Point mouseLoc, String room, ByteArrayOutputStream data, int seqNum) throws IOException {		
		data.write(MOUSE_LOCATION_EVENT);
		encodeRoom(data, room);
		encodeSequenceNumber(data, seqNum);
		data.write(intToBytes(mouseLoc.x));
		data.write(intToBytes(mouseLoc.y));
	}
	
	public static void encodeEndStreamMessage(String room, ByteArrayOutputStream data, int seqNum) throws IOException {		
		data.write(CAPTURE_END_EVENT);
		encodeRoom(data, room);
		encodeSequenceNumber(data, seqNum);
	}
	
	private static byte[] intToBytes(int i) {
		byte[] data = new byte[4];
		data[0] = (byte)((i >> 24) & 0xff);
		data[1] = (byte)((i >> 16) & 0xff);
		data[2] = (byte)((i >> 8) & 0xff);
		data[3] = (byte)(i & 0xff);		
		return data;
	}
	
	private static void encodeRoom(ByteArrayOutputStream data, String room) throws IOException {
		data.write(room.length());
		data.write(room.getBytes());
	}
	
	private static void encodeSequenceNumber(ByteArrayOutputStream data, int seqNum) throws IOException {
		data.write(intToBytes(seqNum));
	}
}
