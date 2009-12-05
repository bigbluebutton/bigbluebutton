/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Richard Alam <ritzalam@gmail.com>
 * 
 * $Id: $
 */
package org.bigbluebutton.webconference.voice.asterisk.konference.events;

public class ConferenceJoinEvent extends KonferenceEvent {
	/*
	 * WARNING: Be careful not to rename the class as Asterisk-Java uses the class name
	 * to convert from raw AMI to Java. Therefore, when the appkonference event name
	 * changes, you should also rename this class.
	 */
	
	private static final long serialVersionUID = 1926565708226475330L;
	
	private String type;
	private String uniqueID;
	private Integer member;
	private String flags;
	private String callerID;
	private String callerIDName;
	private Integer moderators;
	private Integer count;
	private Boolean muted;
	private Boolean speaking;
	
	public ConferenceJoinEvent(Object source) {
        super(source);
    }

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getUniqueID() {
		return uniqueID;
	}

	public void setUniqueID(String uniqueID) {
		this.uniqueID = uniqueID;
	}

	public Integer getMember() {
		return member;
	}

	public void setMember(Integer member) {
		this.member = member;
	}

	public String getFlags() {
		return flags;
	}

	public void setFlags(String flags) {
		this.flags = flags;
	}

	public String getCallerID() {
		return callerID;
	}

	public void setCallerID(String callerID) {
		this.callerID = callerID;
	}

	public String getCallerIDName() {
		return callerIDName;
	}

	public void setCallerIDName(String callerIDName) {
		this.callerIDName = callerIDName;
	}

	public Integer getModerators() {
		return moderators;
	}

	public void setModerators(Integer moderators) {
		this.moderators = moderators;
	}

	public Integer getCount() {
		return count;
	}

	public void setCount(Integer count) {
		this.count = count;
	}

	public Boolean getMuted() {
		return muted;
	}

	public void setMuted(Boolean muted) {
		this.muted = muted;
	}

	public Boolean getSpeaking() {
		return speaking;
	}

	public void setSpeaking(Boolean speaking) {
		this.speaking = speaking;
	}
}
