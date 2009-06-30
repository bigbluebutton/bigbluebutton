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
 * $Id: $
 */

package org.bigbluebutton.test.fixtures

import fit.Fixture
import org.bigbluebutton.conference.service.participants.ParticipantsApplication
import org.bigbluebutton.conference.RoomsManager

public class ParticipantAppFixture  extends Fixture{
	public static ParticipantsApplication app
	private RoomsManager manager
	public String roomName;

	public ParticipantAppFixture() {
		app = new ParticipantsApplication()
		manager = new RoomsManager()
		app.setRoomsManager(manager)
	}	
}
