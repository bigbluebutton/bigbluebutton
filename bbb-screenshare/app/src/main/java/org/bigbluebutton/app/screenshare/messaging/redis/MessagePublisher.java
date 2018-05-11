/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2018 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.app.screenshare.messaging.redis;

import com.google.gson.Gson;
import org.bigbluebutton.common2.msgs.*;
import java.util.HashMap;
import java.util.Map;

public class MessagePublisher {

	private MessageSender sender;

	public void setMessageSender(MessageSender sender) {
		this.sender = sender;
	}

	public void startH264ToH263TranscoderRequest(String meetingId, String transcoderId, String streamName, String ipAddress) {
		Map<String, String> params = new HashMap<String, String>();
		params.put(Constants.TRANSCODER_TYPE, Constants.TRANSCODE_H264_TO_H263);
		params.put(Constants.MODULE, Constants.SCREENSHARE);
		params.put(Constants.LOCAL_IP_ADDRESS, ipAddress);
		params.put(Constants.DESTINATION_IP_ADDRESS, ipAddress);
		params.put(Constants.INPUT, streamName);
		params.put(Constants.AUTH_TOKEN, "unknown-authToken");
		params.put(Constants.USER_ID, "unknown-userId");
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
		routing.put(Constants.SENDER, "bbb-screenshare");
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
