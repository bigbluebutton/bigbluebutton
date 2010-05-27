package org.bigbluebutton.deskshare.client;

import java.awt.HeadlessException;
import java.awt.MouseInfo;
import java.awt.Point;
import java.awt.PointerInfo;

public class MouseLocationTaker implements Runnable {
	
	private MouseLocationListener listeners;
	private volatile boolean trackMouseLocation = false;
	private int captureWidth;
	private int captureHeight;
	private int scaleWidth;
	private int scaleHeight;
	
	public MouseLocationTaker(int captureWidth, int captureHeight, int scaleWidth, int scaleHeight) {
		this.captureWidth = captureWidth;
		this.captureHeight = captureHeight;
		this.scaleWidth = scaleWidth;
		this.scaleHeight = scaleHeight;
	}
	
	public Point getMouseLocation() {
		PointerInfo pInfo;
		Point pointerLocation = new Point(0,0);
		
		try {
			pInfo = MouseInfo.getPointerInfo();
		} catch (HeadlessException e) {
			pInfo = null;
		} catch (SecurityException e) {
			pInfo = null;
		}
		
		if (pInfo == null) return pointerLocation;
		
		if (adjustPointerLocationDueToScaling()) {			
			pointerLocation = calculatePointerLocation(pInfo.getLocation());
		} else {
			pointerLocation = pInfo.getLocation();
		}
		return pointerLocation;		
	}
	
	private Point calculatePointerLocation(Point p) {
		double mx = ((double)p.x/(double)captureWidth) * (double)scaleWidth;
		double my = ((double)p.y/(double)captureHeight) * (double)scaleHeight;
		return new Point((int)mx, (int)my);
	}
	
	public boolean adjustPointerLocationDueToScaling() {
		return (captureWidth != scaleWidth && captureHeight != scaleHeight);
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
