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
package org.bigbluebutton.deskshare.client;

import java.awt.image.BufferedImage;
import java.util.HashSet;
import java.util.Set;

public class ScreenCaptureTaker implements Runnable {
	
	private ScreenCapture capture;
	private int timeBase;
//	private Set<IScreenCaptureListener> listeners = new HashSet<IScreenCaptureListener>();
	private IScreenCaptureListener listeners;
	
	private volatile boolean startCapture = false;
	
	public ScreenCaptureTaker(ScreenCapture capture){
		System.out.println("Capture thread constructor.");
		this.capture = capture;
		this.timeBase = 1000 / capture.getProperFrameRate();
	}
	
	public void run(){		
		while (startCapture){
			BufferedImage image = capture.takeSingleSnapshot();
			notifyListeners(image);
			
			try{
				Thread.sleep(timeBase);
			} catch (Exception e){
				System.out.println("Exception sleeping.");
				System.exit(0);
			}
		}
		
		System.out.println("Stopping screen capture.");
	}
	
	private void notifyListeners(BufferedImage image) {
//		for (IScreenCaptureListener listener : listeners) {
			listeners.onScreenCaptured(image);
//		}		
	}
	
	public void addListener(IScreenCaptureListener listener) {
//		listeners.add(listener);
		listeners = listener;
	}

	public void removeListener(IScreenCaptureListener listener) {
//		listeners.remove(listener);
	}
	
	public void setCapture(boolean capture) {
		startCapture = capture;
	}
}
