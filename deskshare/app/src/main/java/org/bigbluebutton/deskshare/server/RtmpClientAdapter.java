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
package org.bigbluebutton.deskshare.server;

import java.awt.Point;
import java.util.ArrayList;

import org.bigbluebutton.deskshare.server.recorder.RecordStatusListener;
import org.bigbluebutton.deskshare.server.recorder.event.AbstractDeskshareRecordEvent;
import org.bigbluebutton.deskshare.server.recorder.event.RecordErrorEvent;
import org.bigbluebutton.deskshare.server.recorder.event.RecordEvent;
import org.bigbluebutton.deskshare.server.recorder.event.RecordStartedEvent;
import org.bigbluebutton.deskshare.server.recorder.event.RecordStoppedEvent;
import org.bigbluebutton.deskshare.server.recorder.event.RecordUpdateEvent;
import org.red5.server.api.so.ISharedObject;

public class RtmpClientAdapter implements DeskshareClient, RecordStatusListener {

	private final ISharedObject so;
	private long lastUpdate = 0;
	
	public RtmpClientAdapter(ISharedObject so) {
		this.so = so;
	}
	
	public void sendDeskshareStreamStopped(ArrayList<Object> msg) {
		so.sendMessage("deskshareStreamStopped" , msg);
	}
	
	public void sendDeskshareStreamStarted(int width, int height) {
		ArrayList<Object> msg = new ArrayList<Object>();
		msg.add(new Integer(width));
		msg.add(new Integer(height));
		so.sendMessage("appletStarted" , msg);
	}
	
	public void sendMouseLocation(Point mouseLoc) {
		ArrayList<Object> msg = new ArrayList<Object>();
		msg.add(new Integer(mouseLoc.x));
		msg.add(new Integer(mouseLoc.y));
		so.sendMessage("mouseLocationCallback", msg);
	}

	@Override
	public void notify(RecordEvent event) {
		// TODO Auto-generated method stub
//		System.out.println("RtmpClientAdapter: TODO Notify client of recording status");
		ArrayList<Object> msg = new ArrayList<Object>();
		if (event instanceof RecordStoppedEvent) {
			msg.add(new String("DESKSHARE_RECORD_STOPPED_EVENT"));
		} else if (event instanceof RecordStartedEvent) {
			msg.add(new String("DESKSHARE_RECORD_STARTED_EVENT"));
		} else if (event instanceof RecordUpdateEvent) {
			long now = System.currentTimeMillis();
			// We send an update every 30sec that the screen is being recorded.
			if ((now - lastUpdate) > 30000) {
				msg.add(new String("DESKSHARE_RECORD_UPDATED_EVENT"));
				lastUpdate = now;
			}
		} else if (event instanceof RecordErrorEvent) {
			msg.add(new String("DESKSHARE_RECORD_ERROR_EVENT"));
		}
		
//		so.sendMessage("recordingStatusCallback", msg);	
	}	
	
}
