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
package org.bigbluebutton.webconference.voice.internal;

import org.bigbluebutton.webconference.voice.Participant;

import net.jcip.annotations.ThreadSafe;

@ThreadSafe
class ParticipantImp implements Participant {
	private final int id;
	private final String name;
	private boolean muted = false;
	private boolean talking = false;
	
	ParticipantImp(int id, String name) {
		this.id = id;
		this.name = name;
	}
	
	synchronized void setTalking(boolean talking) {
		this.talking = talking;
	}

	synchronized void setMuted(boolean muted) {
		this.muted = muted;
	}
	
	synchronized public boolean isMuted() {
		return muted;
	}

	synchronized public boolean isTalking() {
		return talking;
	}

	public int getId() {
		return id;
	}

	public String getName() {
		return name;
	}
}
