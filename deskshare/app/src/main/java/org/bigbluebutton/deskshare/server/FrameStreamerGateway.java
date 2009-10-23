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
package org.bigbluebutton.deskshare.server;

import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.bigbluebutton.deskshare.server.session.ScreenVideoFrame;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.so.ISharedObject;
import org.slf4j.Logger;

public class FrameStreamerGateway { 
	final private Logger log = Red5LoggerFactory.getLogger(FrameStreamerGateway.class, "deskshare");
	
	private final Map<String, IDeskShareStream> streamsMap;
	private FrameStreamFactory streamFactory;
	private DeskShareApplication deskShareApp;
	
	public FrameStreamerGateway() {
		streamsMap = new ConcurrentHashMap<String, IDeskShareStream>();
	}
	
	public void createNewStream(String room, int screenWidth, int screenHeight) {
		log.debug("Creating stream " + room);
		System.out.println("FrameStreamerGateway Creating stream " + room);
		IDeskShareStream stream = streamFactory.createStream(room, screenWidth, screenHeight);

		streamsMap.put(room, stream);
		stream.start();
			
		//notify the clients in the room that the stream has now started broadcasting.
		ISharedObject deskSO = deskShareApp.getSharedObject(stream.getScope(), "deskSO");
		deskSO.sendMessage("appletStarted" , new ArrayList<Object>());

	}
	
	public void onCaptureEndEvent(String room) {
		IDeskShareStream ds = streamsMap.remove(room);
		if (ds != null) {
			ds.stop();
			ds = null;
		}
	}
	
	public void onCaptureEvent(ScreenVideoFrame event) {
//		System.out.println("FrameStreamerGateway onCaptureEvent");
		IDeskShareStream ds = streamsMap.get(event.getRoom());
		if (ds != null) {
			CaptureUpdateEvent cue = new CaptureUpdateEvent(event.getRoom(), event.getVideoData());
//			System.out.println("FrameStreamerGateway passing to IDeskShareStream");
			ds.accept(cue);
		} else {
			System.out.println("FrameStreamerGateway: could not find DeskShareStream " + event.getRoom());
		}
	}

	public boolean isStreaming(String room){
		return streamsMap.containsKey(room);
	}
	
	public int getRoomVideoWidth(String room){
		IDeskShareStream ds = streamsMap.get(room);
		if (ds != null) {
			return ds.getWidth();
		}
		return 0;
	}
	
	public int getRoomVideoHeight(String room){
		IDeskShareStream ds = streamsMap.get(room);
		if (ds != null) {
			return ds.getHeight();
		}
		return 0;
	}	
	
	public void setStreamFactory(FrameStreamFactory sf) {
		this.streamFactory = sf;
	}
	
	public void setDeskShareApplication(DeskShareApplication app) {
		this.deskShareApp = app;
	}
}
