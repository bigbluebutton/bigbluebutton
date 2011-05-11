package org.bigbluebutton.redis;

import org.bigbluebutton.web.services.DynamicConferenceService;

import redis.clients.jedis.JedisPubSub;

/*
 * Pubsub pattern
 * 		- bigbluebutton:meeting:*
 * Subchannels
 * 		- bigbluebutton:meeting:state --> value: "<confid>:started" or "<confid>:ended"
 * 		- bigbluebutton:meeting:participants   --> value: "<confid>:<action>:<userid>:<fullname>:<role>"
 * 			-- action values: join, status, left
 * 
 * */
class PubsubListener extends JedisPubSub {
	
	DynamicConferenceService dynamicConferenceService;
	
	private static String PATTERN_MEETING="bigbluebutton:meeting:*";
	
	private static String CHANNEL_STATE="bigbluebutton:meeting:state";
	private static String CHANNEL_PARTICIPANTS="bigbluebutton:meeting:participants";
	
	private static String COLON=":";

	public PubsubListener() {
		super();
		
	}

	@Override
	public void onMessage(String channel, String message) {
		String[] args=message.split(COLON);
		
		if(channel.equalsIgnoreCase(CHANNEL_STATE)){
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
		else if(channel.equalsIgnoreCase(CHANNEL_PARTICIPANTS)){
			//params extract
			String roomname=args[0];
			String action=args[1];
			
			if(action.equalsIgnoreCase("join")){
				String userid=args[2];
				String fullname=args[3];
				String role=args[4];
				dynamicConferenceService.participantsUpdatedJoin(roomname, userid, fullname, role);
			}
			else if(action.equalsIgnoreCase("status")){
				String userid=args[2];
				String status=args[3];
				String value=args[4];
				dynamicConferenceService.participantsUpdatedStatus(roomname, userid, status, value);
			}
			else if(action.equalsIgnoreCase("left")){
				String userid=args[2];
				dynamicConferenceService.participantsUpdatedLeft(roomname, userid);
			}
			
		}
	}

	@Override
	public void onPMessage(String pattern, String channel,
            String message) {
		
		System.out.println("redis message received. pattern "+pattern+" | channel "+channel+" | message "+message);

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
