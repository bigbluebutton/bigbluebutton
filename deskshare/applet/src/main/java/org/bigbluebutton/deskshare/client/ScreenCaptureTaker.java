/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Affero General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Richard Alam <ritzalam@gmail.com>
 *
 * $Id: $x
 */
package org.bigbluebutton.deskshare.client;

import java.awt.image.BufferedImage;

public class ScreenCaptureTaker implements Runnable {	
	private ScreenCapture capture;
	private IScreenCaptureListener listeners;
	
	private volatile boolean startCapture = false;
		
	public ScreenCaptureTaker(ScreenCapture capture){
		this.capture = capture;
	}
	
	public void run(){		
		while (startCapture){
//			System.out.println("----- Taking screen capture -----");
			BufferedImage image = capture.takeSingleSnapshot();
			notifyListeners(image);
			try{
				Thread.sleep(200);
			} catch (Exception e){
				System.out.println("Exception sleeping.");
			}
		}
		
		System.out.println("Stopping screen capture.");		
		listeners.screenCaptureStopped();
	}
	
	private void notifyListeners(BufferedImage image) {
		listeners.onScreenCaptured(image);
	}
		
	public void addListener(IScreenCaptureListener listener) {
		listeners = listener;
	}
	
	public void start() {
		startCapture = true;
	}
	
	public void stop() {
		startCapture = false;
	}
}
