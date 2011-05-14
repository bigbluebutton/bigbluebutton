package org.bigbluebutton.web.services;

//import org.bigbluebutton.conference.Room;
import java.util.Collection;
import org.bigbluebutton.api.domain.DynamicConference;

public interface IDynamicConferenceService {
	void cleanupOldConferences();
	public Collection<DynamicConference> getAllConferences();
	
	public void storeConference(DynamicConference conf);
	
	//public Room getRoomByMeetingID(String meetingID);
	
	public DynamicConference getConferenceByMeetingID(String meetingID);
	
	public boolean isMeetingWithVoiceBridgeExist(String voiceBridge);
		
	// these methods called by spring integration:
	/*public void conferenceStarted(Room room);
	
	public void conferenceEnded(Room room);
	
	public void participantsUpdated(Room room);*/
}
