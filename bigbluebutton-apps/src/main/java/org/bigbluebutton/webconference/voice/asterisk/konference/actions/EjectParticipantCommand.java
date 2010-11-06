/** 
* ===License Header===
*
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
* ===License Header===
*/
package org.bigbluebutton.webconference.voice.asterisk.konference.actions;

import org.asteriskjava.manager.action.CommandAction;
import org.asteriskjava.manager.response.ManagerResponse;
import org.bigbluebutton.webconference.voice.asterisk.konference.KonferenceEventsTransformer;

public class EjectParticipantCommand extends KonferenceCommand {
	private static final String SPACE = " ";
	
	private final Integer participant;
	
	public EjectParticipantCommand(String room, Integer participant, Integer requesterId) {
		super(room, requesterId);
		this.participant = participant;
	}

	@Override
	public CommandAction getCommandAction() {
		return new CommandAction("konference kick" + SPACE + room + SPACE + participant);
	}

	@Override
	public void handleResponse(ManagerResponse response, KonferenceEventsTransformer eventHandler) {
		/*
		 * No need to handle the response. If the command was successful, the AMI should be 
		 * generating events which is handled by another class.
		 */
	}


}
