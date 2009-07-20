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
package org.bigbluebutton.deskshare;

import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.red5.server.api.so.ISharedObject;

public class StreamerGateway { 
	private final Map<String, DeskShareStream> dsMap;
	private StreamFactory sf;
	private DeskShareApplication app;
	
	public StreamerGateway() {
		dsMap = new ConcurrentHashMap<String, DeskShareStream>();
	}
	
	public void onCaptureStartEvent(CaptureStartEvent event) {
		DeskShareStream stream = sf.createStream(event);

		dsMap.put(event.getRoom(), stream);
		stream.start();
			
		//notify the clients in the room that the stream has now started broadcasting.
		ISharedObject deskSO = app.getSharedObject(stream.getScope(), "deskSO");
		deskSO.sendMessage("appletStarted" , new ArrayList<Object>());

	}
	
	public void onCaptureEndEvent(CaptureEndEvent event) {
		DeskShareStream ds = dsMap.remove(event.getRoom());
		if (ds != null) {
			ds.stop();
			ds = null;
		}
	}
	
	public void onCaptureEvent(CaptureEvent event) {
		DeskShareStream ds = dsMap.get(event.getRoom());
		if (ds != null) {
			ds.accept(event);
		}
	}

	public boolean isStreaming(String room){
		DeskShareStream ds = dsMap.get(room);
		if (ds != null) {
			return true;
		}
		return false;
	}
	
	public int getRoomVideoWidth(String room){
		DeskShareStream ds = dsMap.get(room);
		if (ds != null) {
			return ds.getWidth();
		}
		return 0;
	}
	
	public int getRoomVideoHeight(String room){
		DeskShareStream ds = dsMap.get(room);
		if (ds != null) {
			return ds.getHeight();
		}
		return 0;
	}	
	
	public void setStreamFactory(StreamFactory sf) {
		this.sf = sf;
	}
	
	public void setDeskShareApplication(DeskShareApplication app) {
		this.app = app;
	}
}
