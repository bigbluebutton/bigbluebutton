package org.bigbluebutton.deskshare.client.frame;

public interface CaptureRegionListener {

	void onStartCapture(int x, int y, int width, int height);
	void onStopCapture();
	void onCaptureRegionMoved(int x, int y);
}
