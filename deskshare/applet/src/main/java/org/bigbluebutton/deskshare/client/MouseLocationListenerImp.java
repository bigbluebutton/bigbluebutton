package org.bigbluebutton.deskshare.client;

import java.awt.Point;

import org.bigbluebutton.deskshare.client.net.CursorMessage;
import org.bigbluebutton.deskshare.client.net.NetworkStreamSender;

public class MouseLocationListenerImp implements MouseLocationListener {

	private final NetworkStreamSender sender;
	private final String room;
	
	public MouseLocationListenerImp(NetworkStreamSender sender, String room) {
		this.sender = sender;
		this.room = room;
	}
	
	@Override
	public void onMouseLocationUpdate(Point loc) {
		CursorMessage msg = new CursorMessage(loc, room);
		sender.send(msg);
	}

}
