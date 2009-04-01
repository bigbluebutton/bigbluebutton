package org.bigbluebutton.conference


public interface IParticipantStatusChangeListener{

	public void participantStatusChange(String userid, String status, Object value);
	
}
