/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.conference.service.presentation;

import java.util.Map;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.Red5;
import org.red5.server.api.scope.IScope;
import org.bigbluebutton.conference.BigBlueButtonSession;
import org.bigbluebutton.conference.Constants;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;

public class PresentationService {	
	private static Logger log = Red5LoggerFactory.getLogger( PresentationService.class, "bigbluebutton" );
	
	private IBigBlueButtonInGW bbbInGW;
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW inGW) {
		bbbInGW = inGW;
	}

	public void removePresentation(Map<String, Object> msg) {
		String presentationID = (String) msg.get("presentationID");
		
		IScope scope = Red5.getConnectionLocal().getScope();
		bbbInGW.removePresentation(scope.getName(), presentationID);
	}
	
	public void getSlideInfo() {
		IScope scope = Red5.getConnectionLocal().getScope();
		String meetingID = scope.getName();
		String requesterID = getBbbSession().getInternalUserID();
		// Just hardcode as we don't really need it for flash client. (ralam may 7, 2014)
		String replyTo = meetingID + "/" + requesterID; 
		bbbInGW.getSlideInfo(meetingID, requesterID, replyTo);		
	}
	
	public void clear() {
		IScope scope = Red5.getConnectionLocal().getScope();
		bbbInGW.clear(scope.getName());
	}
	
	public void getPresentationInfo() {
		IScope scope = Red5.getConnectionLocal().getScope();
		String meetingID = scope.getName();
		String requesterID = getBbbSession().getInternalUserID();
		// Just hardcode as we don't really need it for flash client. (ralam may 7, 2014)
		String replyTo = meetingID + "/" + requesterID; 
		bbbInGW.getPresentationInfo(meetingID, requesterID, replyTo);
	}
	
	public void gotoSlide(Map<String, Object> msg) {
		String pageId = (String) msg.get("page");
		
		IScope scope = Red5.getConnectionLocal().getScope();
		log.debug("Got GotoSlide for meeting [{}] page=[{}]", scope.getName(), pageId);

		bbbInGW.gotoSlide(scope.getName(), pageId);
	}
	
	public void sharePresentation(Map<String, Object> msg) {
		String presentationID = (String) msg.get("presentationID");
		Boolean share = (Boolean) msg.get("share");
		
		IScope scope = Red5.getConnectionLocal().getScope();
		bbbInGW.sharePresentation(scope.getName(), presentationID, share);
	}
	
	public void sendCursorUpdate(Map<String, Object> msg) {
		IScope scope = Red5.getConnectionLocal().getScope();
		
		Double xPercent;
		if (msg.get("xPercent") instanceof Integer) {
			Integer tempXOffset = (Integer) msg.get("xPercent");
			xPercent = tempXOffset.doubleValue();
		} else {
			xPercent = (Double) msg.get("xPercent");
		}

		Double yPercent;
		
		if (msg.get("yPercent") instanceof Integer) {
			Integer tempYOffset = (Integer) msg.get("yPercent");
			yPercent = tempYOffset.doubleValue();
		} else {
			yPercent = (Double) msg.get("yPercent");
		}
		
		bbbInGW.sendCursorUpdate(scope.getName(), xPercent, yPercent);
	}
	
	public void resizeAndMoveSlide(Map<String, Object> msg) {
		Double xOffset;
		if (msg.get("xOffset") instanceof Integer) {
			Integer tempXOffset = (Integer) msg.get("xOffset");
			xOffset = tempXOffset.doubleValue();
		} else {
			xOffset = (Double) msg.get("xOffset");
		}

		Double yOffset;
		
		if (msg.get("yOffset") instanceof Integer) {
			Integer tempYOffset = (Integer) msg.get("yOffset");
			yOffset = tempYOffset.doubleValue();
		} else {
			yOffset = (Double) msg.get("yOffset");
		}
		 
		Double widthRatio;
		if (msg.get("widthRatio") instanceof Integer) {
			Integer tempWRatio = (Integer) msg.get("widthRatio");
			widthRatio = tempWRatio.doubleValue();
		} else {
			widthRatio = (Double) msg.get("widthRatio");
		}
				
		
		Double heightRatio;
		if (msg.get("heightRatio") instanceof Integer) {
			Integer tempHRatio = (Integer) msg.get("heightRatio");
			heightRatio = tempHRatio.doubleValue();
		} else {
			heightRatio = (Double) msg.get("heightRatio");
		}
		
		IScope scope = Red5.getConnectionLocal().getScope();
		bbbInGW.resizeAndMoveSlide(scope.getName(), xOffset, yOffset, widthRatio, heightRatio);
	}
	
	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}
}
