package org.bigbluebutton.core;

import java.util.Iterator;
import java.util.Set;

import org.bigbluebutton.core.messages.Message;


public class Meeting {
	private final String meetingID;
	private Set<BigBlueButtonApp> apps;
	
	public Meeting(String meetingID) {
		this.meetingID = meetingID;
	}
	
	public String getMeetingID() {
		return meetingID;
	}
	
	public void processMessage(Message message) {
		Iterator<BigBlueButtonApp> iter = apps.iterator();
		while (iter.hasNext()) {
			BigBlueButtonApp app = (BigBlueButtonApp) iter.next();
			app.handleMessage(message);
		}		
	}
	
	public void setApplicationListeners(Set<BigBlueButtonApp> apps) {
		this.apps = apps;
	}
}
