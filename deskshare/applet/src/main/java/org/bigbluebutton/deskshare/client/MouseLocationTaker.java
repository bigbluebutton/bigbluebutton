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
package org.bigbluebutton.deskshare.client;

import java.awt.HeadlessException;
import java.awt.Image;
import java.awt.MouseInfo;
import java.awt.Point;
import java.awt.PointerInfo;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import org.bigbluebutton.deskshare.client.MouseLocationListener;

public class MouseLocationTaker {
	
	private MouseLocationListener listeners;
	private volatile boolean trackMouseLocation = false;
	private final Executor mouseLocTakerExec = Executors.newSingleThreadExecutor();
	private Runnable mouseLocRunner;
	
	private int captureWidth;
	private int captureHeight;
	private int scaleWidth;
	private int scaleHeight;
	
	private int captureX;
	private int captureY;
	
	private Point oldMouseLocation = new Point(Integer.MIN_VALUE, Integer.MIN_VALUE);
	
	public MouseLocationTaker(int captureWidth, int captureHeight, int scaleWidth, int scaleHeight, int captureX, int captureY) {
		this.captureWidth = captureWidth;
		this.captureHeight = captureHeight;
		this.scaleWidth = scaleWidth;
		this.scaleHeight = scaleHeight;
		
		this.captureX = captureX;
		this.captureY = captureY;
	}
	
	private Point getMouseLocation() {
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
		
		return pInfo.getLocation();		
	}

	private Point calculatePointerLocation(Point p) {
//		System.out.println("Mouse Tracker:: Image=[" + captureWidth + "," + captureHeight + "] scale=[" + scaleWidth + "," + scaleHeight + "]");
		
		int mouseXInCapturedRegion = p.x - captureX;
		int mouseYInCapturedRegion = p.y - captureY;
		
		double scaledMouseX = mouseXInCapturedRegion * (double)((double)scaleWidth  / (double)captureWidth);
		double scaledMouseY = mouseYInCapturedRegion * (double)((double)scaleHeight  / (double)captureHeight);
		
		return new Point((int)scaledMouseX, (int)scaledMouseY);
		
	}
	
	public boolean adjustPointerLocationDueToScaling() {
		return (captureWidth != scaleWidth && captureHeight != scaleHeight);
	}

	private void takeMouseLocation() {		
		Point mouseLocation = getMouseLocation();
		if ( !mouseLocation.equals(oldMouseLocation) && isMouseInsideCapturedRegion(mouseLocation)) {
//			System.out.println("Mouse is inside captured region [" + mouseLocation.x + "," + mouseLocation.y + "]");
			notifyListeners(calculatePointerLocation(mouseLocation));
			oldMouseLocation = mouseLocation;
		}
	}
	
	private boolean isMouseInsideCapturedRegion(Point p) {
		return true;
//		return ( ( (p.x > captureX) && (p.x < (captureX + captureWidth) ) ) 
//				&& (p.y > captureY && p.y < captureY + captureHeight));
	}
	
	private void notifyListeners(Point location) {
		listeners.onMouseLocationUpdate(location);
	}
		
	public void addListener(MouseLocationListener listener) {
		listeners = listener;
	}

	private void pause(int dur) {
		try{
			Thread.sleep(dur);
		} catch (Exception e){
			System.out.println("Exception sleeping.");
		}
	}
	
	public void start() {
		trackMouseLocation = true;
		mouseLocRunner =  new Runnable() {
			public void run() {
				while (trackMouseLocation){
					takeMouseLocation();
					pause(250);
				}
			}
		};
		mouseLocTakerExec.execute(mouseLocRunner);	
	}
	
	public void stop() {
		trackMouseLocation = false;
	}
	
	public void setCaptureCoordinates(int x, int y){
		captureX = x;
		captureY = y;
	}
}
