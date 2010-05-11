package org.bigbluebutton.deskshare.client.net;

import java.awt.Point;

public class CursorMessage implements Message {

	private Point mouseLoc;
	private String room;
	
	public CursorMessage(Point mouseLoc, String room) {
		this.mouseLoc = mouseLoc;
		this.room = room;
	}
	
	@Override
	public MessageType getMessageType() {
		return MessageType.CURSOR;
	}

	public Point getMouseLocation() {
		return mouseLoc;
	}
	
	public String getRoom() {
		return room;
	}
}
