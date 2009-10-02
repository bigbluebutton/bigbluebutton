package org.bigbluebutton.deskshare.client.net;

public enum CaptureEvents {
	/**
	 * WARNING: Must match corresponding values with deskshare-app on the server.
	 * org.bigbluebutton.deskshare.CaptureEvents
	 */
	CAPTURE_START(0), CAPTURE_UPDATE(1), CAPTURE_END(2);
	
	private final int event;
	
	CaptureEvents(int event) {
		this.event = event;
	}
	
	public int getEvent() {
		return event;
	}
	
	@Override
	public String toString() {
		switch (event) {
		case 0:
			return "Capture Start Event";
		case 1:
			return "Capture Update Event";
		case 2: 
			return "Capture End Event";
		}
		
		return "Unknown Capture Event";
	}
}
