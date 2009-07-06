package org.bigbluebutton.deskshare.client;

import java.awt.image.BufferedImage;
import java.util.HashSet;
import java.util.Set;

public class ScreenCaptureTaker implements Runnable {
	
	private ScreenCapture capture;
	private int timeBase;
	private Set<IScreenCaptureListener> listeners = new HashSet<IScreenCaptureListener>();
	
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
				System.out.println("Sleeping for " + timeBase);
				Thread.sleep(timeBase);
			} catch (Exception e){
				System.out.println("Exception sleeping.");
				System.exit(0);
			}
		}
	}
	
	private void notifyListeners(BufferedImage image) {
		for (IScreenCaptureListener listener : listeners) {
			listener.onScreenCaptured(image);
		}		
	}
	
	public void addListener(IScreenCaptureListener listener) {
		listeners.add(listener);
	}

	public void removeListener(IScreenCaptureListener listener) {
		listeners.remove(listener);
	}
	
	public void setCapture(boolean capture) {
		startCapture = capture;
	}
}
