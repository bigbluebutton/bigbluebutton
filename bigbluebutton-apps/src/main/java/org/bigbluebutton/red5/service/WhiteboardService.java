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
package org.bigbluebutton.red5.service;

import java.util.Map;

import org.bigbluebutton.red5.BigBlueButtonSession;
import org.bigbluebutton.red5.Constants;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.Red5;
import org.red5.server.api.scope.IScope;
import org.slf4j.Logger;

public class WhiteboardService {
	private static Logger log = Red5LoggerFactory.getLogger(WhiteboardService.class, "bigbluebutton");
	private WhiteboardApplication application;
	
	 private final static String TYPE = "type";
	 private final static String STATUS = "status";
	 private final static String COR_ID = "id";
	 private final static String WB_ID = "whiteboardId";
	
	public void setWhiteboardApplication(WhiteboardApplication a){
		log.debug("Setting whiteboard application instance");
		this.application = a;
	}
		
	private boolean validMessage(Map<String, Object> shp) {
		if (shp.containsKey(COR_ID) && shp.containsKey(TYPE) &&
				shp.containsKey(STATUS) && shp.containsKey(WB_ID)) return true;
		
		return false;
	}
	public void sendAnnotation(Map<String, Object> annotation) {
		String meetingID = getMeetingId();
		String requesterID = getBbbSession().getInternalUserID();
		
		if (validMessage(annotation)) {
			application.sendWhiteboardAnnotation(meetingID, requesterID, annotation);
		}		
	}
	
	public void sendCursorPosition(Map<String, Object> msg) {
		String meetingID = getMeetingId();
		String requesterID = getBbbSession().getInternalUserID();
		
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

		application.sendCursorPosition(meetingID, requesterID, xPercent, yPercent);
	}
	
	public void requestAnnotationHistory(Map<String, Object> message) {
		log.info("WhiteboardApplication - requestAnnotationHistory");
		
		String meetingID = getMeetingId();
		String requesterID = getBbbSession().getInternalUserID();
		String wbId = (String) message.get(WB_ID);
		if (wbId != null) {
			application.requestAnnotationHistory(meetingID, requesterID, wbId);	
		}		
	}
		
	public void clear(Map<String, Object> message) {
		log.info("WhiteboardApplication - Clearing board");

		String meetingID = getMeetingId();
		String requesterID = getBbbSession().getInternalUserID();
		String wbId = (String) message.get(WB_ID);
		if (wbId != null) {
			application.clearWhiteboard(meetingID, requesterID, wbId);
		}				
	}
	
	public void undo(Map<String, Object> message) {
		log.info("WhiteboardApplication - Deleting last graphic");
		
		String meetingID = getMeetingId();
		String requesterID = getBbbSession().getInternalUserID();
		String wbId = (String) message.get(WB_ID);
		if (wbId != null) {
			application.undoWhiteboard(meetingID, requesterID, wbId);
		}
	}
	
	public void toggleGrid() {
		log.info("WhiteboardApplication - Toggling grid mode");
		//application.toggleGrid();
	}
		
	public void modifyWhiteboardAccess(Map<String, Object> message) {
		log.info("WhiteboardApplication - Setting whiteboard multi user access: " + (Boolean)message.get("multiUser"));

		String meetingID = getMeetingId();
		String requesterID = getBbbSession().getInternalUserID();
		Boolean multiUser = (Boolean)message.get("multiUser");
		
		application.modifyWhiteboardAccess(meetingID, requesterID, multiUser);
	}
	
	public void getWhiteboardAccess() {
		String meetingID = getMeetingId();
		String requesterID = getBbbSession().getInternalUserID();		
		application.getWhiteboardAccess(meetingID, requesterID);
	}
	
	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}
	
	private String getMeetingId(){
		return Red5.getConnectionLocal().getScope().getName();
	}
	
}