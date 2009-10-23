/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Affero General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Richard Alam <ritzalam@gmail.com>
 *
 * $Id: $x
 */
package org.bigbluebutton.deskshare.server.session;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import org.bigbluebutton.deskshare.server.FrameStreamerGateway;

public class FrameStreamer {
	private BlockingQueue<ScreenVideoFrame> screenQ = new LinkedBlockingQueue<ScreenVideoFrame>(10);
	private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable capturedScreenSender;
	private volatile boolean sendCapturedScreen = false;
	
	private FrameStreamerGateway gateway;
	
	public void start() {	
		System.out.println("Starting FrameStreamer ");
		sendCapturedScreen = true;
		capturedScreenSender = new Runnable() {
			public void run() {
				while (sendCapturedScreen) {
					try {
						ScreenVideoFrame videoFrame = screenQ.take();
						if (screenQ.size() > 9) screenQ.clear();
						streamScreenVideoFrame(videoFrame);

					} catch (InterruptedException e) {
						System.out.println("InterruptedExeption while taking event.");
					}
				}
			}
		};
		exec.execute(capturedScreenSender);		
	}
	
	public void sendFrame(ScreenVideoFrame frame) {
		
		try {
			screenQ.put(frame);
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	private void streamScreenVideoFrame(ScreenVideoFrame frame) {
		//flvStreamer.accept(frame);
		gateway.onCaptureEvent(frame);
	}
	
	public void createNewStream(String room, int screenWidth, int screenHeight) {
		System.out.println("Creating new Stream " + room);
		gateway.createNewStream(room, screenWidth, screenHeight);
	}
	
	public void endStream(String room) {
		System.out.println("Stopping streamer");
		gateway.onCaptureEndEvent(room);
	}
	
	public void setFrameStreamerGateway(FrameStreamerGateway gateway) {
		System.out.println("Setting FrameStreamerGateway");
		this.gateway = gateway;
	}
}
