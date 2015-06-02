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
//		for (Map.Entry<String, Object> entry : annotation.entrySet()) {
//		    String key = entry.getKey();
//		    Object value = entry.getValue();
		    
//		    if (key.equals("points")) {
//		    	String points = "points=[";
//		    	ArrayList<Double> v = (ArrayList<Double>) value;
//		    	log.debug(points + pointsToString(v) + "]");
//		    } else {
//		    	log.debug(key + "=[" + value + "]");
//		    }
//		}
			
		String meetingID = getMeetingId();
		String requesterID = getBbbSession().getInternalUserID();
		
		if (validMessage(annotation)) {
			application.sendWhiteboardAnnotation(meetingID, requesterID, annotation);
		}		
	}
	
	/*private String pointsToString(ArrayList<Double> points){
    	String datapoints = "";
    	for (Double i : points) {
    		datapoints += i + ",";
    	}
    	// Trim the trailing comma
//    	log.debug("Data Point = " + datapoints);
    	return datapoints.substring(0, datapoints.length() - 1);

//		application.sendShape(shape, type, color, thickness, fill, fillColor, transparency, id, status);

	}*/
	
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
		
	public void enableWhiteboard(Map<String, Object> message) {
		log.info("WhiteboardApplication - Setting whiteboard enabled: " + (Boolean)message.get("enabled"));

		String meetingID = getMeetingId();
		String requesterID = getBbbSession().getInternalUserID();
		Boolean enable = (Boolean)message.get("enabled");
		
		application.setWhiteboardEnable(meetingID, requesterID, enable);
	}
	
	public void isWhiteboardEnabled() {
		String meetingID = getMeetingId();
		String requesterID = getBbbSession().getInternalUserID();		
		application.setIsWhiteboardEnabled(meetingID, requesterID);
	}
	
	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}
	
	private String getMeetingId(){
		return Red5.getConnectionLocal().getScope().getName();
	}
	
}