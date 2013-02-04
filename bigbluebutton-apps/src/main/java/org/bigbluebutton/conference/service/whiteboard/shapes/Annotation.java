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
package org.bigbluebutton.conference.service.whiteboard.shapes;

import java.util.Map;

public class Annotation {

	private Map<String, Object> annotation;
	
	public Annotation(Map<String, Object> annotation) {
		this.annotation = annotation;
	}
	
	public Map<String, Object> getAnnotation() {
		return annotation;
	}
	
	public String getID() {
		return (String) annotation.get("id");
	}
	
	public void setID(String id) {
		annotation.put("id", id);
	}
	
	public String getType() {
		return (String) annotation.get("type");
	}
	
	public String getStatus() {
		return (String) annotation.get("status");
	}
}
