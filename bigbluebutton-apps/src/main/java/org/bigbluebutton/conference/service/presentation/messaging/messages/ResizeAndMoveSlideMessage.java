package org.bigbluebutton.conference.service.presentation.messaging.messages;

import org.bigbluebutton.conference.meeting.messaging.OutMessage;

public class ResizeAndMoveSlideMessage extends OutMessage {
	private final Double xOffset, yOffset, widthRatio, heightRatio;
	
	public ResizeAndMoveSlideMessage(String meetingID, Boolean recorded, Double xOffset, Double yOffset, Double widthRatio, Double heightRatio) {
		super(meetingID, recorded);
		this.xOffset = xOffset;
		this.yOffset = yOffset;
		this.widthRatio = widthRatio;
		this.heightRatio = heightRatio;
	}

	public Double getxOffset() {
		return xOffset;
	}

	public Double getyOffset() {
		return yOffset;
	}

	public Double getWidthRatio() {
		return widthRatio;
	}

	public Double getHeightRatio() {
		return heightRatio;
	}

}
