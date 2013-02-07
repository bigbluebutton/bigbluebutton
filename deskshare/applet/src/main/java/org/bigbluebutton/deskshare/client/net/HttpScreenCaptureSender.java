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

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import org.bigbluebutton.deskshare.common.CaptureEvents;
import com.myjavatools.web.ClientHttpRequest;

public class HttpScreenCaptureSender implements ScreenCaptureSender {
	private String host = "localhost";
	private String room;
	private int videoWidth;
	private int videoHeight;
	private int frameRate;
	private static final String SCREEN_CAPTURE__URL = "/deskshare/tunnel/screenCapture";
	private URL url;
	URLConnection conn;
	private String videoInfo;

	private BlockingQueue<ScreenVideo> screenQ = new LinkedBlockingQueue<ScreenVideo>();
	private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable capturedScreenSender;
	private volatile boolean sendCapturedScreen = false;	
	
	public void connect(String host, String room, int width, int height) throws ConnectionException {
		this.host = host;
		this.room = room;
		this.videoWidth = videoWidth;
		this.videoHeight = videoHeight;
				
		openConnection();
		sendCaptureStartEvent();

/*
		System.out.println("Starting capturedScreenSender ");
		sendCapturedScreen = true;
		capturedScreenSender = new Runnable() {
			public void run() {
				while (sendCapturedScreen) {
					try {
						System.out.println("ScreenQueue size " + screenQ.size());
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
*/
	}

	private void sendCapturedScreen(ScreenVideo video) throws ConnectionException {

			long snapshotTime = System.currentTimeMillis();
			ByteArrayOutputStream videoData = video.getVideoData();
			openConnection();
			sendVideoData(videoData, video.isKeyFrame());
			long completeTime = System.currentTimeMillis();
			System.out.println("Sending took " + (completeTime - snapshotTime) + "ms.");

	}
	
	private void openConnection() throws ConnectionException {
		/**
		 * Need to re-establish connection each time, otherwise, 
		 * we get java.net.ProtocolException: Cannot write output after reading input.
		 * 
		 * http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4382944
		 * 
		 */				
		try {
			url = new URL("http://" + host + SCREEN_CAPTURE__URL);
			conn = url.openConnection();
		} catch (MalformedURLException e) {
			e.printStackTrace();
			throw new ConnectionException("MalformedURLException " + url.toString());
		} catch (IOException e) {
			e.printStackTrace();
			throw new ConnectionException("IOException while connecting to " + url.toString());
		}
	}
	
	private void sendCaptureStartEvent() throws ConnectionException {
		ClientHttpRequest chr;
		try {
			chr = new ClientHttpRequest(conn);
			chr.setParameter("room", room);
			
			videoInfo = Integer.toString(videoWidth)
								+ "x" + Integer.toString(videoHeight);
			//					+ "x" + Integer.toString(frameRate);
			//StringBuilder sb = new StringBuilder(videoWidth);
			//sb.append("x").append(videoHeight);

			chr.setParameter("videoInfo", videoInfo);
			chr.setParameter("event", CaptureEvents.CAPTURE_START.getEvent());
			chr.post();
		} catch (IOException e) {
			e.printStackTrace();
			throw new ConnectionException("IOException while sending capture start event.");
		}

	}
	
	public void disconnect() throws ConnectionException {
		openConnection();
		sendCaptureEndEvent();
	}

	private void sendCaptureEndEvent() throws ConnectionException {
		ClientHttpRequest chr;
		try {
			chr = new ClientHttpRequest(conn);
			chr.setParameter("room", room);
			
			chr.setParameter("event", CaptureEvents.CAPTURE_END.getEvent());
			chr.post();
		} catch (IOException e) {
			e.printStackTrace();
			throw new ConnectionException("IOException while sending capture end event.");
		}
	}
	
	public void send(ByteArrayOutputStream videoData, boolean isKeyFrame) throws ConnectionException {
/*
		ScreenVideo sv = new ScreenVideo(videoData, isKeyFrame);
		try {
			screenQ.put(sv);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
*/
		long snapshotTime = System.currentTimeMillis();
		openConnection();
		sendVideoData(videoData, isKeyFrame);
		long completeTime = System.currentTimeMillis();
		System.out.println("Sending took " + (completeTime - snapshotTime) + "ms.");
	}
	
	private void sendVideoData(ByteArrayOutputStream videoData, boolean isKeyFrame) throws ConnectionException {
	    ClientHttpRequest chr;
		try {
			chr = new ClientHttpRequest(conn);
		    chr.setParameter("room", room);
		    
		    chr.setParameter("event", CaptureEvents.CAPTURE_UPDATE.getEvent());
		    chr.setParameter("keyframe", isKeyFrame);
		    
			ByteArrayInputStream cap = new ByteArrayInputStream(videoData.toByteArray());
				
			chr.setParameter("videodata", "screen", cap);
			System.out.println("Video data length = " + videoData.toByteArray().length);
			
			chr.post();		
		} catch (IOException e) {
			e.printStackTrace();
			throw new ConnectionException("IOException while sending video data.");
		}

	}
}
