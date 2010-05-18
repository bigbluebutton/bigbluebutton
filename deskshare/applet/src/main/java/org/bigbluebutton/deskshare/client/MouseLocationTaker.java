package org.bigbluebutton.deskshare.client;

import java.awt.HeadlessException;
import java.awt.MouseInfo;
import java.awt.Point;
import java.awt.PointerInfo;

public class MouseLocationTaker implements Runnable {
	
	private MouseLocationListener listeners;
	private volatile boolean trackMouseLocation = false;
	
	public Point getMouseLocation() {
		PointerInfo pInfo;
		try {
			pInfo = MouseInfo.getPointerInfo();
		} catch (HeadlessException e) {
			pInfo = null;
		} catch (SecurityException e) {
			pInfo = null;
		}
		
		if (pInfo == null) return new Point(0,0);
		
		return pInfo.getLocation();		
	}

	@Override
	public void run(){		
		while (trackMouseLocation){
			notifyListeners(getMouseLocation());
			try{
				Thread.sleep(250);
			} catch (Exception e){
				System.out.println("Exception sleeping.");
			}
		}
	}
	
	private void notifyListeners(Point location) {
		listeners.mouseLocation(location);
	}
		
	public void addListener(MouseLocationListener listener) {
		listeners = listener;
	}
	
	public void start() {
		trackMouseLocation = true;
	}
	
	public void stop() {
		trackMouseLocation = false;
	}
}
