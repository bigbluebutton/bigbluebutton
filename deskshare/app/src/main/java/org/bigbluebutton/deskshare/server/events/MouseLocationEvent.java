package org.bigbluebutton.deskshare.server.events;

import java.awt.Point;

public class MouseLocationEvent {

	private String room;
	private Point loc;
	
	public MouseLocationEvent(String room, Point loc) {
		this.room = room;
		this.loc = loc;
	}
	
	public String getRoom() {
		return room;
	}
	
	public Point getLoc() {
		return loc;
	}
}
