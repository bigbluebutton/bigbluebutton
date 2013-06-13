package org.bigbluebutton.conference.service.presentation.messaging.messages;

import org.bigbluebutton.conference.meeting.messaging.OutMessage;

public class GetSlideInfoReply extends OutMessage {

	private final Double xOffset, yOffset, widthRatio, heightRatio;
	private final String requesterID;
	
	public GetSlideInfoReply(String meetingID, Boolean recorded, String requesterID, Double xOffset, Double yOffset, Double widthRatio, Double heightRatio) {
		super(meetingID, recorded);
		this.requesterID = requesterID;
		this.xOffset = xOffset;
		this.yOffset = yOffset;
		this.widthRatio = widthRatio;
		this.heightRatio = heightRatio;
	}

	public String getRequesterID() {
		return requesterID;
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
