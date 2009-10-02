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

import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.Socket;
import java.net.UnknownHostException;

public class SocketScreenCaptureSender implements ScreenCaptureSender {
	
	private static final int PORT = 9123;
	
	//private static final int PORT = 1026;
	
	private Socket socket = null;
	
	private DataOutputStream outStream = null;
	private String room;
	private int width, height;
	
	private static final byte CAPTURE_START_EVENT = 0;
	private static final byte CAPTURE_UPDATE_EVENT = 1;
	private static final byte CAPTURE_END_EVENT = 2;
		
	private static final byte[] HEADER = new byte[] {0x42, 0x42, 0x42, 0x2D, 0x44, 0x53}; /* BBB-DS */
	
	public void connect(String host, String room, int width, int height) {
		this.room = room;
		this.width = width;
		this.height = height;
		
		try{
			socket = new Socket(host, PORT);
			outStream = new DataOutputStream(socket.getOutputStream());
			sendHeaderEventAndRoom(CAPTURE_START_EVENT);
			sendScreenCaptureInfo(width, height);
		} catch(UnknownHostException e){
			System.out.println("Unknow host: " + host);
		} catch(IOException e) {
			System.out.println("IOException when trying connecting to " + host);
		}
	}
	
	private void sendScreenCaptureInfo(int videoWidth, int videoHeight) throws IOException {
		String videoInfo = Integer.toString(videoWidth)	+ "x" + Integer.toString(videoHeight);
		System.out.println("Sending video info " + videoInfo);
		outStream.writeInt(videoInfo.length());
		outStream.writeBytes(videoInfo);
	}
	
	public void send(ByteArrayOutputStream pixels, boolean isKeyFrame) {
		try {
			sendHeaderEventAndRoom(CAPTURE_UPDATE_EVENT);
			sendKeyFrame(isKeyFrame);
			System.out.println("Sending pixels with length " + pixels.size());
			sendDataLength(pixels.size());
			sendData(pixels);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	private void sendHeaderEventAndRoom(byte event) throws IOException {
		outStream.write(HEADER);
		outStream.writeByte(event);
		outStream.writeInt(room.length());
		outStream.writeBytes(room);
	}
	
	private void sendKeyFrame(boolean isKeyFrame) throws IOException {
		outStream.writeBoolean(isKeyFrame);
	}
	
	private void sendDataLength(int length) throws IOException {
		outStream.writeInt(length);
	}
	
	private void sendData(ByteArrayOutputStream pixels) throws IOException {
		outStream.write(pixels.toByteArray());
	}
	
	public void disconnect(){
		System.out.println("Closing connection.");
		try{
			sendHeaderEventAndRoom(CAPTURE_END_EVENT);
			socket.close();
		} catch(IOException e){
			e.printStackTrace(System.out);
		}
	}
}
