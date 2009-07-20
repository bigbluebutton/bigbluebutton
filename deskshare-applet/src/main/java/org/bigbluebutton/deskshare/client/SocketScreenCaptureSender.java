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
package org.bigbluebutton.deskshare.client;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.Socket;
import java.net.UnknownHostException;

import javax.imageio.ImageIO;

public class SocketScreenCaptureSender implements IScreenCaptureSender {
	
	private static final int PORT = 9123;
	
	//private static final int PORT = 1026;
	
	private Socket socket = null;
	
	private DataOutputStream outStream = null;
	private PrintWriter out;
	private String room;
	private int videoWidth;
	private int videoHeight;
	private int frameRate;
	
	public void connect(String host, String room, int videoWidth, int videoHeight, int frameRate) {
		this.room = room;
		this.videoWidth = videoWidth;
		this.videoHeight = videoHeight;
		this.frameRate = frameRate;
		try{
			socket = new Socket(host, PORT);
			out = new PrintWriter(socket.getOutputStream(), true);
			outStream = new DataOutputStream(socket.getOutputStream());
			sendRoom(room);
			sendScreenCaptureInfo(videoWidth, videoHeight, frameRate);
			
		} catch(UnknownHostException e){
			System.out.println("Unknow host: " + host);
		} catch(IOException e) {
			System.out.println("IOException when trying connecting to " + host);
		}
	}
	
	private void sendRoom(String room) {
		out.println(room);
	}
	
	private void sendScreenCaptureInfo(int videoWidth, int videoHeight, int frameRate) {
			out.println(Integer.toString(videoWidth)
					+ "x" + Integer.toString(videoHeight)
					+ "x" + Integer.toString(frameRate));
	}
	
	public void send(BufferedImage screenCapture) {
		sendRoom(room);
		sendScreenCaptureInfo(videoWidth, videoHeight, frameRate);
		try{
			ByteArrayOutputStream byteConvert = new ByteArrayOutputStream();
			ImageIO.write(screenCapture, "jpeg", byteConvert);
			byte[] imageData = byteConvert.toByteArray();
			outStream.writeInt(imageData.length);
			//out.println("xxx");
			outStream.write(imageData);
			//out.println("vvv");
			System.out.println("Sent: "+ imageData.length);
			outStream.flush();
		} catch(IOException e){
			System.out.println("IOException while sending screen capture.");
		}
	}

	public void disconnect(){
		System.out.println("Closing connection.");
		try{
			socket.close();
		} catch(IOException e){
			e.printStackTrace(System.out);
		}
	}
}
