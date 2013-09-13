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

import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.Socket;
import java.net.UnknownHostException;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import org.bigbluebutton.deskshare.common.CaptureEvents;

public class SocketScreenVideoSender implements ScreenCaptureSender {
	
	private static final int PORT = 9123;
	
	private Socket socket = null;
	
	private DataOutputStream outStream = null;
	private String room;
	private int width, height;
	
	private BlockingQueue<ScreenVideo> screenQ = new LinkedBlockingQueue<ScreenVideo>(2);
	private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable capturedScreenSender;
	private volatile boolean sendCapturedScreen = false;
	
	private static final byte[] HEADER = new byte[] {0x42, 0x42, 0x42, 0x2D, 0x44, 0x53}; /* BBB-DS */
	
	public void connect(String host, String room, int width, int height) throws ConnectionException {
		this.room = room;
		this.width = width;
		this.height = height;
		
		try {
			socket = new Socket(host, PORT);
			outStream = new DataOutputStream(socket.getOutputStream());
			sendHeaderEventAndRoom(CaptureEvents.CAPTURE_START.getEvent());
			sendScreenCaptureInfo(width, height);
			outStream.flush();
		} catch (UnknownHostException e) {
			e.printStackTrace();
			throw new ConnectionException("UnknownHostException: " + host);
		} catch (IOException e) {
			e.printStackTrace();
			throw new ConnectionException("IOException: " + host + ":" + PORT);
		}

		System.out.println("Starting capturedScreenSender ");
		sendCapturedScreen = true;
		capturedScreenSender = new Runnable() {
			public void run() {
				while (sendCapturedScreen) {
					try {
						//System.out.println("ScreenQueue size " + screenQ.size());
						ScreenVideo newScreen = screenQ.take();
						try {
							sendCapturedScreen(newScreen);
						} catch (ConnectionException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
					} catch (InterruptedException e) {
						System.out.println("InterruptedExeption while taking event.");
					}
				}
			}
		};
		exec.execute(capturedScreenSender);	
	}
	
	private void sendScreenCaptureInfo(int videoWidth, int videoHeight) throws IOException {
		String videoInfo = Integer.toString(videoWidth)	+ "x" + Integer.toString(videoHeight);
		System.out.println("Sending video info " + videoInfo);
		outStream.writeInt(videoInfo.length());
		outStream.writeBytes(videoInfo);
	}
	
	private void sendCapturedScreen(ScreenVideo video) throws ConnectionException {
		try {
			long snapshotTime = System.currentTimeMillis();
			ByteArrayOutputStream videoData = video.getVideoData();
			sendHeaderEventAndRoom(CaptureEvents.CAPTURE_UPDATE.getEvent());
			sendKeyFrame(video.isKeyFrame());
			System.out.println("Sending videoData [length=" + videoData.size() + ", keyframe=" + video.isKeyFrame() + "]");
			sendDataLength(videoData.size());
			sendData(videoData);
			outStream.flush();
			long completeTime = System.currentTimeMillis();
			System.out.println("Sending took " + (completeTime - snapshotTime) + "ms.");
		} catch (IOException e) {
			e.printStackTrace();
			throw new ConnectionException("IOException while sending video data.");
		}

	}
	
	public void send(ByteArrayOutputStream videoData, boolean isKeyFrame) throws ConnectionException {

		ScreenVideo sv = new ScreenVideo(videoData, isKeyFrame);
		try {
			screenQ.put(sv);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}

/*
		try {
			long snapshotTime = System.currentTimeMillis();
			sendHeaderEventAndRoom(CaptureEvents.CAPTURE_UPDATE.getEvent());
			sendKeyFrame(isKeyFrame);
			System.out.println("Sending videoData [" + videoData.size() + "," + isKeyFrame + "]");
			sendDataLength(videoData.size());
			sendData(videoData);
			long completeTime = System.currentTimeMillis();
			System.out.println("Sending took " + (completeTime - snapshotTime) + "ms.");
		} catch (IOException e) {
			e.printStackTrace();
			throw new ConnectionException("IOException while sending video data.");
		}
*/
	}

	private void sendHeaderEventAndRoom(int event) throws IOException {
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
		//outStream.write(pixels.toByteArray());
		pixels.writeTo(outStream);
	}
	
	public void disconnect() throws ConnectionException {
		System.out.println("Closing connection.");
		sendCapturedScreen = false;
		try{
			sendHeaderEventAndRoom(CaptureEvents.CAPTURE_END.getEvent());
			socket.close();
		} catch(IOException e){
			e.printStackTrace(System.out);
			throw new ConnectionException("IOException while disconnecting from server.");
		}
	}
}
