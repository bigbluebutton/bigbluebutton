package org.bigbluebutton.redis;

import org.bigbluebutton.web.services.DynamicConferenceService;

import redis.clients.jedis.JedisPubSub;

/*
 * Pubsub channels:
 * 		- bigbluebutton:conference:status --> value: "<confid>:started" or "<confid>:ended"
 * 		- bigbluebutton:conference:join   --> value: "<confid>:<userid>:<fullname>:<role>"
 * 		- bigbluebutton:conference:remove --> value: "<confid>:<userid>"
 * 
 * 
 * */
class PubsubListener extends JedisPubSub {
	
	DynamicConferenceService dynamicConferenceService;
	
	private static String PATTERN_CONFERENCE="bigbluebutton:conference:*";
	
	private static String CHANNEL_STATUS="bigbluebutton:conference:status";
	private static String CHANNEL_JOIN="bigbluebutton:conference:join";
	private static String CHANNEL_LEAVE="bigbluebutton:conference:remove";
	
	private static String COLON=":";

	public PubsubListener() {
		super();
		
	}

	@Override
	public void onMessage(String channel, String message) {
		
	}

	@Override
	public void onPMessage(String pattern, String channel,
            String message) {
		
		System.out.println("redis message received. pattern:"+pattern+" channel:"+channel+" message:"+message);
		
		if(pattern.equalsIgnoreCase(PATTERN_CONFERENCE)){
			String[] args=message.split(COLON);
			
			if(channel.equalsIgnoreCase(CHANNEL_STATUS)){
				//params extract
				String roomname=args[0];
				String status=args[1];
				
				if(status.equalsIgnoreCase("started")){
					dynamicConferenceService.conferenceStarted2(roomname);
				}
				else if(status.equalsIgnoreCase("ended")){
					dynamicConferenceService.conferenceEnded2(roomname);
				}
				
			}
			else if(channel.equalsIgnoreCase(CHANNEL_JOIN)){
				//params extract
				String roomname=args[0];
				String userid=args[1];
				String fullname=args[2];
				String role=args[3];
				
				dynamicConferenceService.participantsUpdatedJoin(roomname, userid, fullname, role);
			}
			else if(channel.equalsIgnoreCase(CHANNEL_LEAVE)){
				String roomname=args[0];
				String userid=args[1];
				
				dynamicConferenceService.participantsUpdatedRemove(roomname, userid);
			}
		}
		
	}

	@Override
	public void onPSubscribe(String pattern, int subscribedChannels) {
		// TODO Auto-generated method stub

	}

	@Override
	public void onPUnsubscribe(String pattern, int subscribedChannels) {
		// TODO Auto-generated method stub

	}

	@Override
	public void onSubscribe(String channel, int subscribedChannels) {
		// TODO Auto-generated method stub

	}

	@Override
	public void onUnsubscribe(String channel, int subscribedChannels) {
		// TODO Auto-generated method stub

	}

	public void setDynamicConferenceService(DynamicConferenceService dynamicConferenceService) {
		this.dynamicConferenceService = dynamicConferenceService;
	}
}
