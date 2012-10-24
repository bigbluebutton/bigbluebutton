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
	
	public boolean hasErrors() {
		return errors.size() > 0;
	}
		
	public ArrayList<String[]> getErrors() {
		return errors;
	}
}
