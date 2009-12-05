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
package org.bigbluebutton.webconference.voice.asterisk.konference;

import org.bigbluebutton.webconference.voice.ConferenceServerListener;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceJoinEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceLeaveEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceMemberMuteEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceMemberUnmuteEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.ConferenceStateEvent;
import org.bigbluebutton.webconference.voice.asterisk.konference.events.KonferenceEvent;

public class KonferenceEventHandler {
	
	private ConferenceServerListener listener;
	
	public void handleKonferenceEvent(KonferenceEvent event) {
		if (event instanceof ConferenceJoinEvent) {
			ConferenceJoinEvent cj = (ConferenceJoinEvent) event;
			listener.joined(cj.getConferenceName(), cj.getMember(), cj.getCallerIDName(), cj.getMuted(), cj.getSpeaking());
		} else if (event instanceof ConferenceLeaveEvent) {
			ConferenceLeaveEvent cl = (ConferenceLeaveEvent) event;
			listener.left(cl.getConferenceName(), cl.getMember());
		} else if (event instanceof ConferenceMemberMuteEvent) {
			ConferenceMemberMuteEvent cmm = (ConferenceMemberMuteEvent) event;
			listener.muted(cmm.getConferenceName(), cmm.getMemberId(), true);
		} else if (event instanceof ConferenceMemberUnmuteEvent) {
			ConferenceMemberUnmuteEvent cmu = (ConferenceMemberUnmuteEvent) event;
			listener.muted(cmu.getConferenceName(), cmu.getMemberId(), false);
		} else if (event instanceof ConferenceStateEvent) {
			ConferenceStateEvent cse = (ConferenceStateEvent) event;
			boolean talking = "speaking".equals(cse.getState())? true : false;
			listener.talking(cse.getConferenceName(), cse.getMemberId(), talking);	
		}		
	}

	public void setListener(ConferenceServerListener listener) {
		this.listener = listener;
	}
	
}
