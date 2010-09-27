package org.bigbluebutton.deskshare.client;

import org.bigbluebutton.deskshare.client.frame.CaptureRegionFrame;
import org.bigbluebutton.deskshare.client.frame.CaptureRegionListener;

public class ScreenRegionSharer implements ScreenSharer {
	private final ScreenShareInfo ssi;
	private ScreenSharerRunner sharer;
	private ClientListener listener;
	private CaptureRegionFrame frame;
	
	public ScreenRegionSharer(ScreenShareInfo ssi) {
		this.ssi = ssi;
	}
	
	public void start() {
		CaptureRegionListener crl = new CaptureRegionListenerImp(this);
		frame = new CaptureRegionFrame(crl, 5);
		System.out.println("Init [" + ssi.x + "," + ssi.y + "][" + ssi.captureWidth + "," + ssi.captureHeight + "]");
		frame.setHeight(ssi.captureHeight);
		frame.setWidth(ssi.captureWidth);
		frame.setLocation(ssi.x, ssi.y);
		frame.setVisible(true);		
		System.out.println("Launching Screen Capture Frame");
	}
	
	public void addClientListener(ClientListener l) {
		listener = l;
	}
	
	public void stop() {
		sharer.stopSharing();
		System.out.println("Closing Screen Capture Frame");
	}
	
	private class CaptureRegionListenerImp implements CaptureRegionListener {
		private final ScreenRegionSharer srs;
		
		public CaptureRegionListenerImp(ScreenRegionSharer srs) {
			this.srs = srs;
		}
		
		@Override
		public void onCaptureRegionMoved(int x, int y) {
			ssi.x = x;
			ssi.y = y;
			System.out.println("Moving [" + ssi.x + "," + ssi.y + "][" + ssi.captureWidth + "," + ssi.captureHeight + "]");
			if (sharer != null)
				sharer.setCaptureCoordinates(x, y);
		}

		@Override
		public void onStartCapture(int x, int y, int width, int height) {
			ssi.x = x;
			ssi.y = y;
			ssi.captureWidth = width;
			ssi.captureHeight = height;
			ssi.scaleWidth = width;
			ssi.scaleHeight = height;
			System.out.println("Capturing [" + ssi.x + "," + ssi.y + "][" + ssi.captureWidth + "," + ssi.captureHeight + "]");
			sharer = new ScreenSharerRunner(ssi);
			sharer.addClientListener(listener);
			sharer.startSharing();
		}

		@Override
		public void onStopCapture() {
			srs.stop();
		}
	}
}
