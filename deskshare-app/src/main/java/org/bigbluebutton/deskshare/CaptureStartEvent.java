package org.bigbluebutton.deskshare;

public class CaptureStartEvent extends CaptureEvent implements ICaptureEvent {

	public CaptureStartEvent(CapturedScreen cs) {
		super(cs);
	}

}
