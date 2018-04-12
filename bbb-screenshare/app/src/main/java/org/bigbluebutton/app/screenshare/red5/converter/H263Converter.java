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
package org.bigbluebutton.app.screenshare.red5.converter;

import org.bigbluebutton.app.screenshare.messaging.redis.MessagePublisher;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.slf4j.Logger;

public class H263Converter {

	private static Logger log = Red5LoggerFactory.getLogger(H263Converter.class, "screenshare");

	private final String H263_ID = "H263-";

	private Integer numListeners = 0;

	private MessagePublisher publisher;
	private Boolean publishing;
	private String ipAddress;
	private String meetingId;
	private String streamName;
	private String transcoderId;

	public H263Converter(String origin, String meetingId, MessagePublisher publisher) {
		log.info("Spawn FFmpeg to convert H264 to H263 for stream [{}]", origin);
		this.meetingId = meetingId;
		this.streamName = origin;
		this.publisher = publisher;
		this.publishing = false;
		this.transcoderId = H263_ID + origin;

		IConnection conn = Red5.getConnectionLocal();
		this.ipAddress = conn.getHost();
	}

	private void startConverter() {
		if (!publishing) {
			publisher.startH264ToH263TranscoderRequest(this.meetingId, this.transcoderId, this.streamName, this.ipAddress);
			publishing = true;
		} else log.debug("No need to start transcoder, it is already running");
	}

	public synchronized void addListener() {
		this.numListeners++;
		log.debug("Adding listener to [{}] ; [{}] current listeners ", this.streamName, this.numListeners);

		if (this.numListeners.equals(1)) {
			log.debug("First listener just joined, must start H263Converter for [{}]", this.meetingId);
			startConverter();
		}
	}

	public synchronized void removeListener() {
		this.numListeners--;
		log.debug("Removing listener from [{}] ; [{}] current listeners ", this.streamName, this.numListeners);

		if (this.numListeners <= 0) {
			log.debug("No more listeners, may close H263Converter for [{}]", this.meetingId);
			this.stopConverter();
		}
	}

	public synchronized void stopConverter() {
		if (publishing) {
			this.numListeners = 0;
			publisher.stopTranscoderRequest(this.streamName, this.transcoderId);
			publishing = false;
			log.debug("Transcoder force-stopped");
		} else log.debug("No need to stop transcoder, it already stopped");
	}
}
