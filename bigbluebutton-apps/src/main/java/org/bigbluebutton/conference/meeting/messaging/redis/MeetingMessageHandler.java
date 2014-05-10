package org.bigbluebutton.conference.meeting.messaging.redis;

import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.conference.service.messaging.CreateMeetingMessage;
import org.bigbluebutton.conference.service.messaging.DestroyMeetingMessage;
import org.bigbluebutton.conference.service.messaging.EndMeetingMessage;
import org.bigbluebutton.conference.service.messaging.IMessage;
import org.bigbluebutton.conference.service.messaging.KeepAliveMessage;
import org.bigbluebutton.conference.service.messaging.MessageFromJsonConverter;
import org.bigbluebutton.conference.service.messaging.MessagingConstants;
import org.bigbluebutton.conference.service.messaging.RegisterUserMessage;
import org.bigbluebutton.conference.service.messaging.ValidateAuthTokenMessage;
import org.bigbluebutton.conference.service.messaging.redis.MessageHandler;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;


import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class MeetingMessageHandler implements MessageHandler {
	private static Logger log = Red5LoggerFactory.getLogger(MeetingMessageHandler.class, "bigbluebutton");
	
	private IBigBlueButtonInGW bbbGW;
	
	@Override
	public void handleMessage(String pattern, String channel, String message) {
		log.debug("Checking message: " + pattern + " " + channel + " " + message);
		if (channel.equalsIgnoreCase(MessagingConstants.TO_MEETING_CHANNEL)) {

			IMessage msg = MessageFromJsonConverter.convert(message);
			
			if (msg != null) {
				if (msg instanceof EndMeetingMessage) {
					EndMeetingMessage emm = (EndMeetingMessage) msg;
					log.info("Received end meeting request. Meeting id [{}]", emm.meetingId);
					bbbGW.endMeeting(emm.meetingId);
				} else if (msg instanceof CreateMeetingMessage) {
					CreateMeetingMessage emm = (CreateMeetingMessage) msg;
					bbbGW.createMeeting2(emm.id, emm.name, emm.record, emm.voiceBridge, emm.duration);
				} else if (msg instanceof RegisterUserMessage) {
					RegisterUserMessage emm = (RegisterUserMessage) msg;
					bbbGW.registerUser(emm.meetingID, emm.internalUserId, emm.fullname, emm.role, emm.externUserID, emm.authToken);
				} else if (msg instanceof DestroyMeetingMessage) {
					DestroyMeetingMessage emm = (DestroyMeetingMessage) msg;
					log.info("Received destroy meeting request. Meeting id [{}]", emm.meetingId);
					bbbGW.destroyMeeting(emm.meetingId);
				} else if (msg instanceof ValidateAuthTokenMessage) {
					ValidateAuthTokenMessage emm = (ValidateAuthTokenMessage) msg;
					log.info("Received ValidateAuthTokenMessage toekn request. Meeting id [{}]", emm.meetingId);
					bbbGW.validateAuthToken(emm.meetingId, emm.userId, emm.token, emm.replyTo);
				}
			}
		} else if (channel.equalsIgnoreCase(MessagingConstants.TO_SYSTEM_CHANNEL)) {
			IMessage msg = MessageFromJsonConverter.convert(message);
			
			if (msg != null) {
				if (msg instanceof KeepAliveMessage) {
					KeepAliveMessage emm = (KeepAliveMessage) msg;
					log.info("Received KeepAliveMessage request. Meeting id [{}]", emm.keepAliveId);
					bbbGW.isAliveAudit(emm.keepAliveId);					
				}
			}
		}
	}
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW bbbGW) {
		this.bbbGW = bbbGW;
	}
	
}
