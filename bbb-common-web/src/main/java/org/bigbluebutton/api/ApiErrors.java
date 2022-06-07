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

package org.bigbluebutton.api;

import java.util.ArrayList;

public class ApiErrors {
	private ArrayList<String[]> errors = new ArrayList<String[]>();

	public void missingParamError(String param) {
		errors.add(new String[] {"MissingParam", "You did not pass a " + param + " parameter."});
	}

	public void checksumError() {
		errors.add( new String[] {"checksumError", "You did not pass the checksum security check"});
	}

	public void nonUniqueMeetingIdError() {
		errors.add(new String[] {"NotUniqueMeetingID", "A meeting already exists with that meeting ID.  Please use a different meeting ID."});
	}

	public void nonUniqueVoiceBridgeError() {
		errors.add(new String[] {"nonUniqueVoiceBridge", "The selected voice bridge is already in use."});
	}

	public void invalidMeetingIdError() {
		errors.add(new String[] {"invalidMeetingId", "The meeting ID that you supplied did not match any existing meetings"});
	}

	public void meetingForciblyEndedError() {
		errors.add(new String[] {"meetingForciblyEnded", "You can not re-join a meeting that has already been forcibly ended."});
	}

	public void invalidPasswordError() {
		errors.add(new String[] {"invalidPassword", "The password you submitted is not valid."});
	}

	public void mismatchCreateTimeParam() {
		errors.add(new String[] {"mismatchCreateTime", "The createTime parameter submitted mismatches with the current meeting."});
	}

	public void recordingNotFound() {
		errors.add(new String[] {"recordingNotFound", "We could not find a recording with that recordID."});
	}

	public void noConfigFoundForToken(String token) {
		errors.add(new String[] {"configNotFound", "We could not find a config for token [" + token + "]."});
	}

	public void noConfigFound() {
		errors.add(new String[] {"noConfigFound", "We could not find a config for this request."});
	}

	public void maxParticipantsReached() {
		errors.add(new String[] {"maxParticipantsReached", "The number of participants allowed for this meeting has been reached."});
	}

	public void addError(String[] error) {
		errors.add(error);
	}

	public boolean hasErrors() {
		return !errors.isEmpty();
	}

	public ArrayList<String[]> getErrors() {
		return errors;
	}
}
