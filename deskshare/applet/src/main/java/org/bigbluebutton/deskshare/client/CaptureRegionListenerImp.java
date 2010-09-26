package org.bigbluebutton.deskshare.client;

import org.bigbluebutton.deskshare.client.frame.CaptureRegionListener;

public class CaptureRegionListenerImp implements CaptureRegionListener {

	private final ScreenCaptureTaker sct;
	private final MouseLocationTaker mlt;
	
	public CaptureRegionListenerImp(ScreenCaptureTaker sct, MouseLocationTaker mlt) {
		this.sct = sct;
		this.mlt = mlt;
	}
	
	@Override
	public void onCaptureRegionMoved(int x, int y) {
		sct.setCaptureCoordinates(x, y);
		mlt.setCaptureCoordinates(x, y);
	}

	@Override
	public void onStartCapture() {
		sct.start();
		mlt.start();
	}

	@Override
	public void onStopCapture() {
		sct.stop();
		mlt.stop();
	}

}
