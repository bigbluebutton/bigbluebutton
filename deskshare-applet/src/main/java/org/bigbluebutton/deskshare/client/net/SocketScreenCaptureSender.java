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

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.Socket;
import java.net.UnknownHostException;
import java.util.ArrayList;

import javax.imageio.ImageIO;

import org.bigbluebutton.deskshare.client.tiles.ChangedTile;


public class SocketScreenCaptureSender implements ScreenCaptureSender {
	
	private static final int PORT = 9123;
	
	//private static final int PORT = 1026;
	
	private Socket socket = null;
	
	private DataOutputStream outStream = null;
	private PrintWriter out;
	private String room;
	private int videoWidth;
	private int videoHeight;
	private int frameRate;
	
	private static final int CAPTURE_START = 0;
	private static final int CAPTURE_UPDATE = 1;
	private static final int CAPTURE_END = 2;
	
	public void connect(String host, String room, int videoWidth, int videoHeight, int frameRate) {
		this.room = room;
		this.videoWidth = videoWidth;
		this.videoHeight = videoHeight;
		this.frameRate = frameRate;
		try{
			socket = new Socket(host, PORT);
			outStream = new DataOutputStream(socket.getOutputStream());
			sendCaptureStartMessage();
			sendRoom(room);
			sendScreenCaptureInfo(videoWidth, videoHeight, frameRate);
			
		} catch(UnknownHostException e){
			System.out.println("Unknow host: " + host);
		} catch(IOException e) {
			System.out.println("IOException when trying connecting to " + host);
		}
	}
	
	private void sendCaptureStartMessage() throws IOException {
		outStream.writeInt(CAPTURE_START);		
	}
	
	private void sendRoom(String room) throws IOException {
		outStream.writeInt(room.length());
		outStream.writeBytes(room);
	}
	private void sendScreenCaptureInfo(int videoWidth, int videoHeight, int frameRate) throws IOException {
		String videoInfo = Integer.toString(videoWidth)	+ "x" + Integer.toString(videoHeight) + "x" + Integer.toString(frameRate);
		System.out.println("Sending video info " + videoInfo);
		outStream.writeInt(videoInfo.length());
		outStream.writeBytes(videoInfo);
	}
	
	public void send(ArrayList<ChangedTile> changedTiles) {		
		for (ChangedTile ct : changedTiles) {			
			sendChangedTileInfo(ct);
			sendTile(ct);
		}
	}

	private void sendCaptureUpdateMessage() throws IOException {
		outStream.writeInt(CAPTURE_UPDATE);		
	}
	
	private void sendChangedTileInfo(ChangedTile tile) {
		String tileInfo = Integer.toString(tile.getWidth())
							+ "x" + Integer.toString(tile.getHeight())
							+ "x" + Integer.toString(tile.getX())
							+ "x" + Integer.toString(tile.getY())
							+ "x" + Integer.toString(tile.getPosition());
		try {
			sendCaptureUpdateMessage();
			outStream.writeInt(tileInfo.length());
			outStream.writeBytes(tileInfo);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}		
		
	}
	
	private void sendTile(ChangedTile tile) {
		try{
			ByteArrayOutputStream byteConvert = new ByteArrayOutputStream();
			ImageIO.write(tile.getImage(), "jpeg", byteConvert);
			byte[] imageData = byteConvert.toByteArray();
			outStream.writeInt(imageData.length);
			outStream.write(imageData);
//			System.out.println("Sent: tile "+ tile.getPosition() + " with size " + imageData.length);
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
