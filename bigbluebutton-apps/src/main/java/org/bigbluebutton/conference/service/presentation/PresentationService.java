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
import org.red5.logging.Red5LoggerFactory;import org.red5.server.api.Red5;import org.red5.server.api.scope.IScope;
import org.bigbluebutton.conference.BigBlueButtonSession;
import org.bigbluebutton.conference.Constants;

public class PresentationService {	
	private static Logger log = Red5LoggerFactory.getLogger( PresentationService.class, "bigbluebutton" );
	
	private PresentationApplication presentationApplication;

	public void removePresentation(Map<String, Object> msg) {
		String presentationID = (String) msg.get("presentationID");
		
		IScope scope = Red5.getConnectionLocal().getScope();
		presentationApplication.removePresentation(scope.getName(), presentationID);
	}
	
	public void getPresentationInfo() {
		IScope scope = Red5.getConnectionLocal().getScope();
		presentationApplication.getPresentationInfo(scope.getName(), getBbbSession().getInternalUserID());
	}
	
	public void gotoSlide(Map<String, Object> msg) {
		Integer slideNum = (Integer) msg.get("pageNumber");
		
		log.debug("Request to go to slide " + slideNum);
		IScope scope = Red5.getConnectionLocal().getScope();
		presentationApplication.gotoSlide(scope.getName(), slideNum);
	}
	
	public void sharePresentation(Map<String, Object> msg) {
		String presentationID = (String) msg.get("presentationID");
		Boolean share = (Boolean) msg.get("share");
		
		IScope scope = Red5.getConnectionLocal().getScope();
		presentationApplication.sharePresentation(scope.getName(), presentationID, share);
	}
	
	public void sendCursorUpdate(Map<String, Object> msg) {
		IScope scope = Red5.getConnectionLocal().getScope();
		presentationApplication.sendCursorUpdate(scope.getName(), (Double) msg.get("xPercent"), (Double) msg.get("yPercent"));
	}
	
	public void resizeAndMoveSlide(Map<String, Object> msg) {
		Double xOffset = (Double) msg.get("xOffset");
		Double yOffset = (Double) msg.get("yOffset");
		Double widthRatio = (Double) msg.get("widthRatio");
		Double heightRatio = (Double) msg.get("heightRatio");
		
		log.debug("Request to resize and move slide[" + xOffset + "," + yOffset + "," + widthRatio + "," + heightRatio);
		IScope scope = Red5.getConnectionLocal().getScope();
		presentationApplication.resizeAndMoveSlide(scope.getName(), xOffset, yOffset, widthRatio, heightRatio);
	}

	public void setPresentationApplication(PresentationApplication a) {
		log.debug("Setting Presentation Applications");
		presentationApplication = a;
	}
	
	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}
}
