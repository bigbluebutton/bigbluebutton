package org.bigbluebutton.deskshare.server;

import java.awt.Point;
import java.util.ArrayList;

import org.bigbluebutton.deskshare.server.recorder.RecordStatusListener;
import org.bigbluebutton.deskshare.server.recorder.event.RecordEvent;
import org.red5.server.api.so.ISharedObject;

public class RtmpClientAdapter implements DeskshareClient, RecordStatusListener {

	private final ISharedObject so;
	
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
		System.out.println("RtmpClientAdapter: TODO Notify client of recording status");
	}
}
