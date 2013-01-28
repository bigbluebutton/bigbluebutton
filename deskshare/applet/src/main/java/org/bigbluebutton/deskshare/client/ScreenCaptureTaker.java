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

import java.awt.image.BufferedImage;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

public class ScreenCaptureTaker {	
	private ScreenCapture capture;
	private ScreenCaptureListener listeners;
	
	private volatile boolean startCapture = false;
	private final Executor screenCapTakerExec = Executors.newSingleThreadExecutor();
	private Runnable screenCapRunner;
	
	public ScreenCaptureTaker(int x, int y, int captureWidth, int captureHeight, int scaleWidth, int scaleHeight, boolean quality){
		capture = new ScreenCapture(x, y, captureWidth, captureHeight, scaleWidth, scaleHeight, quality);
	}

	public void setCaptureCoordinates(int x, int y){
		capture.setX(x);
		capture.setY(y);
	}
	
	private void captureScreen() {		
//		System.out.println("----- Taking screen capture -----");
		long start = System.currentTimeMillis();
		BufferedImage image = capture.takeSingleSnapshot();
		long end = System.currentTimeMillis();
//		System.out.println("Capture took " + (end - start) + " millis");
		notifyListeners(image);
	}
	
	private void notifyListeners(BufferedImage image) {
		listeners.onScreenCaptured(image);
	}
		
	public void addListener(ScreenCaptureListener listener) {
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
		startCapture = true;
		screenCapRunner =  new Runnable() {
			public void run() {
				while (startCapture){
					captureScreen();
					pause(200);
				}
				System.out.println("Stopping screen capture.");		
			}
		};
		screenCapTakerExec.execute(screenCapRunner);	
	}
	
	public void stop() {
		startCapture = false;
	}
}
