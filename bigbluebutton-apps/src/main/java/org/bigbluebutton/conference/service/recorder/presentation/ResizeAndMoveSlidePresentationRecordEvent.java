package org.bigbluebutton.conference.service.recorder.presentation;

public class ResizeAndMoveSlidePresentationRecordEvent extends
		AbstractPresentationRecordEvent {
	
	public ResizeAndMoveSlidePresentationRecordEvent() {
		super();
		setEvent("ResizeAndMoveSlideEvent");
	}
	
	public void setXOffset(double offset) {
		eventMap.put("xOffset", Double.toString(offset));
	}

	public void setYOffset(double offset) {
		eventMap.put("yOffset", Double.toString(offset));
	}
	
	public void setWidthRatio(double ratio) {
		eventMap.put("widthRatio", Double.toString(ratio));
	}

	public void setHeightRatio(double ratio) {
		eventMap.put("heightRatio", Double.toString(ratio));
	}
}
