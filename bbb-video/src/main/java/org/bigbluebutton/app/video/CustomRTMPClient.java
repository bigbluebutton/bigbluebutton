/*
 * RED5 Open Source Flash Server - http://code.google.com/p/red5/
 *
 * Copyright 2006-2012 by respective authors (see below). All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.bigbluebutton.app.video;

import org.red5.client.net.rtmp.RTMPClient;
import org.red5.server.service.PendingCall;
import org.red5.server.net.rtmp.event.Ping;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

/**
 * Custom RTMP Client
 *
 * This client behaves like the flash player plugin when requesting to play a stream
 * 
 * @author Mateus Dalepiane (mdalepiane@gmail.com)
 */

public class CustomRTMPClient extends RTMPClient {
	private static Logger log = Red5LoggerFactory.getLogger(CustomRTMPClient.class);

	public void play(int streamId, String name) {
		log.info("play stream "+ streamId + ", name: " + name);
		if (conn != null) {
			// get the channel
			int channel = getChannelForStreamId(streamId);
			// send our requested buffer size
			ping(Ping.CLIENT_BUFFER, streamId, 2000);
			// send our request for a/v
			PendingCall receiveAudioCall = new PendingCall("receiveAudio");
			conn.invoke(receiveAudioCall, channel);
			PendingCall receiveVideoCall = new PendingCall("receiveVideo");
			conn.invoke(receiveVideoCall, channel);
			// call play
			Object[] params = new Object[1];
			params[0] = name;
			PendingCall pendingCall = new PendingCall("play", params);
			conn.invoke(pendingCall, channel);
		} else {
			log.warn("Trying to play on a null connection");
		}
	}
}
