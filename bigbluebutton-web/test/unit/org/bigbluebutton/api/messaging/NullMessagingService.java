package org.bigbluebutton.api.messaging;

import java.util.List;
import java.util.Map;

public class NullMessagingService implements MessagingService {

	public void start() {
		// TODO Auto-generated method stub

	}

	public void stop() {
		// TODO Auto-generated method stub

	}

	@Override
	public void recordMeetingInfo(String meetingId, Map<String, String> info) {
		// TODO Auto-generated method stub

	}

	/*@Override
	public void recordMeetingMetadata(String meetingId,
			Map<String, String> metadata) {
		// TODO Auto-generated method stub

	}*/

	@Override
	public void endMeeting(String meetingId) {
		// TODO Auto-generated method stub

	}

	@Override
	public void send(String channel, String message) {
		// TODO Auto-generated method stub

	}

	public void addListener(MessageListener listener) {
		// TODO Auto-generated method stub

	}

	public void removeListener(MessageListener listener) {
		// TODO Auto-generated method stub

	}

  public void destroyMeeting(String meetingID) {
	  // TODO Auto-generated method stub
	  
  }

  public void createMeeting(String meetingID, String externalMeetingID, String meetingName,
      Boolean recorded, String voiceBridge, Long duration) {
	  // TODO Auto-generated method stub
	  
  }

  public void sendPolls(String meetingId, String title, String question,
      String questionType, List<String> answers) {
	  // TODO Auto-generated method stub
	  
  }

  public String storeSubscription(String meetingId, String externalMeetingID,
      String callbackURL) {
	  // TODO Auto-generated method stub
	  return null;
  }

  public boolean removeSubscription(String meetingId, String subscriptionId) {
	  // TODO Auto-generated method stub
	  return false;
  }

  public List<Map<String, String>> listSubscriptions(String meetingId) {
	  // TODO Auto-generated method stub
	  return null;
  }

	@Override
  public void registerUser(String meetingID, String internalUserId,
      String fullname, String role, String externUserID, String authToken, String avatarURL) {
	  // TODO Auto-generated method stub
	  
  }

	@Override
  public void sendKeepAlive(String keepAliveId) {
	  // TODO Auto-generated method stub
	  
  }

}
