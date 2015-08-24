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
package org.bigbluebutton.core.recorders.events;

import java.util.ArrayList;
import java.util.Map;

public class ModifyTextWhiteboardRecordEvent  extends AbstractWhiteboardRecordEvent {

		public ModifyTextWhiteboardRecordEvent() {
			super();
			setEvent("ModifyTextEvent");
		}
		
		public void addAnnotation(Map<String, Object> annotation) {
			for (Map.Entry<String, Object> entry : annotation.entrySet()) {
			    String key = entry.getKey();
			    		    
			    if (key.equals("points")) {
			    	ArrayList<Double> value = (ArrayList<Double>)entry.getValue();
			    	eventMap.put("dataPoints", pointsToString(value));
			    } else {
			    	Object value = entry.getValue();
			    	eventMap.put(key, value.toString());
			    }
			}
		}
		
		private String pointsToString(ArrayList<Double> points){
	    	String datapoints = "";
	    	for (Double i : points) {
	    		datapoints += i + ",";
	    	}
	    	// Trim the trailing comma
	    	return datapoints.substring(0, datapoints.length() - 1);
		}
}
