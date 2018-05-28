package org.bigbluebutton.red5.pubsub;


//import org.bigbluebutton.common.messages.UserSharedWebcamMessage;
//import org.bigbluebutton.common.messages.UserUnshareWebcamRequestMessage;

import com.google.gson.Gson;
import org.bigbluebutton.common2.msgs.*;

import java.util.HashMap;
import java.util.Map;

public class MessagePublisher {

	private MessageSender sender;
	
	public void setMessageSender(MessageSender sender) {
		this.sender = sender;
	}

	private Map<String, Object> buildEnvelope(String name, Map<String, String> routing) {
		Map<String, Object> envelope = new HashMap<String, Object>();
		envelope.put("name", name);
		envelope.put("routing", routing);
		return envelope;
	}

	private Map<String, String> buildRouting() {
		Map<String, String> routing = new HashMap<String, String>();
		routing.put("msgType", "SYSTEM");
		routing.put("sender", "bbb-video");
		return routing;
	}

	public void validateConnAuthToken(String meetingId, String userId, String authToken, String connId) {
		BbbCoreBaseHeader header = new BbbCoreBaseHeader("ValidateConnAuthTokenSysMsg");
		ValidateConnAuthTokenSysMsgBody body = new ValidateConnAuthTokenSysMsgBody(meetingId,
				userId, authToken, connId, "VIDEO");
		ValidateConnAuthTokenSysMsg msg = new ValidateConnAuthTokenSysMsg(header, body);

		Map<String, String> routing = buildRouting();
		Map<String, Object> envelope = buildEnvelope("ValidateConnAuthTokenSysMsg", routing);

		Map<String, Object> fullmsg = new HashMap<String, Object>();
		fullmsg.put("envelope", envelope);
		fullmsg.put("core", msg);

		Gson gson = new Gson();
		String json = gson.toJson(fullmsg);

		sender.send("to-akka-apps-redis-channel", json);
	}

	public void sendVideoStreamStartedMsg(String meetingId, String userId, String streamId) {
		BbbClientMsgHeader header = new BbbClientMsgHeader("UserBroadcastCamStartMsg", meetingId, userId);
		UserBroadcastCamStartMsgBody body = new UserBroadcastCamStartMsgBody(streamId);
		UserBroadcastCamStartMsg msg = new UserBroadcastCamStartMsg(header, body);
		Map<String, String> routing = buildRouting();
		Map<String, Object> envelope = buildEnvelope("UserBroadcastCamStartMsg", routing);

		Map<String, Object> fullmsg = new HashMap<String, Object>();
		fullmsg.put("envelope", envelope);
		fullmsg.put("core", msg);

		Gson gson = new Gson();
		String json = gson.toJson(fullmsg);

		sender.send("to-akka-apps-redis-channel", json);
	}

	public void sendVideoStreamStoppedMsg(String meetingId, String userId, String streamId) {
		BbbClientMsgHeader header = new BbbClientMsgHeader("UserBroadcastCamStopMsg", meetingId, userId);
		UserBroadcastCamStopMsgBody body = new UserBroadcastCamStopMsgBody(streamId);
		UserBroadcastCamStopMsg msg = new UserBroadcastCamStopMsg(header, body);
		Map<String, String> routing = buildRouting();
		Map<String, Object> envelope = buildEnvelope("UserBroadcastCamStopMsg", routing);

		Map<String, Object> fullmsg = new HashMap<String, Object>();
		fullmsg.put("envelope", envelope);
		fullmsg.put("core", msg);

		Gson gson = new Gson();
		String json = gson.toJson(fullmsg);

		sender.send("to-akka-apps-redis-channel", json);
	}

	// Polling
	/*
	public void userSharedWebcamMessage(String meetingId, String userId, String streamId) {
		UserSharedWebcamMessage msg = new UserSharedWebcamMessage(meetingId, userId, streamId);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	public void userUnshareWebcamRequestMessage(String meetingId, String userId, String streamId) {
		UserUnshareWebcamRequestMessage msg = new UserUnshareWebcamRequestMessage(meetingId, userId, streamId);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}
	*/
	
	public void startRotateLeftTranscoderRequest(String meetingId, String transcoderId, String streamName, String ipAddress) {
		Map<String, String> params = new HashMap<String, String>();
		params.put(Constants.TRANSCODER_TYPE, Constants.TRANSCODE_ROTATE_LEFT);
		params.put(Constants.LOCAL_IP_ADDRESS, ipAddress);
		params.put(Constants.DESTINATION_IP_ADDRESS, ipAddress);
		params.put(Constants.INPUT, streamName);
		Map<String, Object> body = new HashMap<String, Object>();
		body.put(Constants.TRANSCODER_ID, transcoderId);
		body.put(Constants.PARAMS, params);
		String msg = buildJson("StartTranscoderSysReqMsg", meetingId, body);
		sender.send(MessagingConstants.TO_BBB_TRANSCODE_SYSTEM_CHAN, msg);
	}

	public void startRotateRightTranscoderRequest(String meetingId, String transcoderId, String streamName, String ipAddress) {
		Map<String, String> params = new HashMap<String, String>();
		params.put(Constants.TRANSCODER_TYPE, Constants.TRANSCODE_ROTATE_RIGHT);
		params.put(Constants.LOCAL_IP_ADDRESS, ipAddress);
		params.put(Constants.DESTINATION_IP_ADDRESS, ipAddress);
		params.put(Constants.INPUT, streamName);
		Map<String, Object> body = new HashMap<String, Object>();
		body.put(Constants.TRANSCODER_ID, transcoderId);
		body.put(Constants.PARAMS, params);
		String msg = buildJson("StartTranscoderSysReqMsg", meetingId, body);
		sender.send(MessagingConstants.TO_BBB_TRANSCODE_SYSTEM_CHAN, msg);
	}

	public void startRotateUpsideDownTranscoderRequest(String meetingId, String transcoderId, String streamName, String ipAddress) {
		Map<String, String> params = new HashMap<String, String>();
		params.put(Constants.TRANSCODER_TYPE, Constants.TRANSCODE_ROTATE_UPSIDE_DOWN);
		params.put(Constants.LOCAL_IP_ADDRESS, ipAddress);
		params.put(Constants.DESTINATION_IP_ADDRESS, ipAddress);
		params.put(Constants.INPUT, streamName);
		Map<String, Object> body = new HashMap<String, Object>();
		body.put(Constants.TRANSCODER_ID, transcoderId);
		body.put(Constants.PARAMS, params);
		String msg = buildJson("StartTranscoderSysReqMsg", meetingId, body);
		sender.send(MessagingConstants.TO_BBB_TRANSCODE_SYSTEM_CHAN, msg);
	}

	public void startH264ToH263TranscoderRequest(String meetingId, String transcoderId, String streamName, String ipAddress) {
		Map<String, String> params = new HashMap<String, String>();
		params.put(Constants.TRANSCODER_TYPE, Constants.TRANSCODE_H264_TO_H263);
		params.put(Constants.MODULE, Constants.VIDEO);
		params.put(Constants.LOCAL_IP_ADDRESS, ipAddress);
		params.put(Constants.DESTINATION_IP_ADDRESS, ipAddress);
		params.put(Constants.INPUT, streamName);
		Map<String, Object> body = new HashMap<String, Object>();
		body.put(Constants.TRANSCODER_ID, transcoderId);
		body.put(Constants.PARAMS, params);
		String msg = buildJson("StartTranscoderSysReqMsg", meetingId, body);
		sender.send(MessagingConstants.TO_BBB_TRANSCODE_SYSTEM_CHAN, msg);
	}

	public void stopTranscoderRequest(String meetingId, String transcoderId) {
		Map<String, Object> body = new HashMap<String, Object>();
		body.put(Constants.TRANSCODER_ID, transcoderId);
		String msg = buildJson("StopTranscoderSysReqMsg", meetingId, body);
		sender.send(MessagingConstants.TO_BBB_TRANSCODE_SYSTEM_CHAN, msg);
	}

	public String buildJson(String name, String meetingId, Map<String, Object> body) {
		Map<String, Object> message = new HashMap<String, Object>();
		message.put(Constants.ENVELOPE, buildEnvelope(name));
		Map<String, Object> core = new HashMap<String, Object>();
		core.put(Constants.HEADER, buildHeader(name, meetingId));
		core.put(Constants.BODY, body);
		message.put(Constants.CORE, core);
		Gson gson = new Gson();
		return gson.toJson(message);
	}

	private Map<String, Object> buildEnvelope(String name) {
		Map<String, Object> envelope = new HashMap<String, Object>();
		envelope.put(Constants.NAME, name);
		Map<String, Object> routing = new HashMap<String, Object>();
		routing.put(Constants.SENDER, "bbb-video");
		envelope.put(Constants.ROUTING, routing);
		return envelope;
	}

	private Map<String, Object> buildHeader(String name, String meetingId) {
		Map<String, Object> header = new HashMap<String, Object>();
		header.put(Constants.NAME, name);
		header.put(Constants.MEETING_ID, meetingId);
		return header;
	}
}
