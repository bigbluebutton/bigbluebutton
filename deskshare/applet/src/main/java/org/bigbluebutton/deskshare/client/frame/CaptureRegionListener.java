package org.bigbluebutton.deskshare.client.frame;

public interface CaptureRegionListener {

	void onStartCapture();
	void onStopCapture();
	void onCaptureRegionMoved(int x, int y);
}
