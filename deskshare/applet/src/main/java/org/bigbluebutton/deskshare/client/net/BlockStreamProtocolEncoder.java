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

import java.awt.Point;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.zip.Adler32;

import org.bigbluebutton.deskshare.common.Dimension;

public class BlockStreamProtocolEncoder {
	private static final byte[] END_FRAME = new byte[] {'D', 'S', '-', 'E', 'N', 'D'};
	private static final byte[] HEADER = new byte[] {'B', 'B', 'B', '-', 'D', 'S'}; 
    private static final byte CAPTURE_START_EVENT = 0;
    private static final byte CAPTURE_UPDATE_EVENT = 1;
    private static final byte CAPTURE_END_EVENT = 2;
    private static final byte MOUSE_LOCATION_EVENT = 3;
    private static final byte CORRUPT_PACKET_EVENT = 7;
    
	public static void encodeStartStreamMessage(String room, Dimension screen, Dimension block,
						ByteArrayOutputStream data, int seqNum, boolean useSVC2) throws IOException {	
		
		data.write(CAPTURE_START_EVENT);
		encodeRoom(data, room);
		encodeSequenceNumber(data, seqNum);
		
		data.write(intToBytes(block.getWidth()));
		data.write(intToBytes(block.getHeight()));
		data.write(intToBytes(screen.getWidth()));
		data.write(intToBytes(screen.getHeight()));
		data.write(useSVC2 ? 1 : 0);
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

	public static void numBlocksChanged(int numBlocks, ByteArrayOutputStream data) throws IOException{
		byte[] nb = new byte[2];
		nb[0] = (byte)((numBlocks >> 8) & 0xff);
		nb[1] = (byte)(numBlocks & 0xff);
		data.write(nb);
	}
	
	public static void encodeRoomAndSequenceNumber(String room, int seqNum, ByteArrayOutputStream data) throws IOException{
		data.write(CAPTURE_UPDATE_EVENT);
		encodeRoom(data, room);		
		encodeSequenceNumber(data, seqNum);		
	}
	
	public static void encodeBlock(BlockVideoData block, ByteArrayOutputStream data) throws IOException {				
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
	
	public static void encodeDelimiter(ByteArrayOutputStream data) throws IOException {
		data.write(END_FRAME);
	}
	
	public static byte[] encodeChecksum(byte[] data) {
		Adler32 checksum = new Adler32();
		checksum.reset();
	    checksum.update(data);
	    return longToBytes(checksum.getValue());
	}
	
	private static byte[] longToBytes(long i) {
		byte[] data = new byte[8];

		data[0] = (byte)((i >> 56) & 0xff);
		data[1] = (byte)((i >> 48) & 0xff);
		data[2] = (byte)((i >> 40) & 0xff);
		data[3] = (byte)((i >> 32) & 0xff);	
		data[4] = (byte)((i >> 24) & 0xff);
		data[5] = (byte)((i >> 16) & 0xff);
		data[6] = (byte)((i >> 8) & 0xff);
		data[7] = (byte)(i & 0xff);
		
		return data;
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
