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
package org.bigbluebutton.conference.service.whiteboard;

import java.util.ArrayList;

import org.red5.compatibility.flex.messaging.io.ArrayCollection;

public abstract class WBGraphic {
	public enum Type {
		SHAPE, TEXT
	}
	
	protected Type graphicType;
	protected String ID;
	protected String status;
	
	public WBGraphic(Type type) {
		graphicType = type;
	}
	
	public Type getGraphicType() {
		return graphicType;
	}
	
	public boolean equals(Object other) {
		return this.ID.equals(((WBGraphic) other).ID);
	}
	
	public int hashCode() {
		return ID.hashCode();
	}
	
	public String getID() {
		return ID;
	}
	
	public abstract ArrayCollection<Object> toList();
	public abstract Object[] toObjectArray();
}
