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

import java.util.HashMap;
import java.util.Map;

import org.red5.server.api.Red5;
import org.red5.server.api.stream.ISubscriberStream;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

import org.bigbluebutton.app.screenshare.messaging.redis.MessagePublisher;

public class H263VideoHandler {

	private static Logger log = Red5LoggerFactory.getLogger(H263VideoHandler.class, "screenshare");

	public static String H263PREFIX = "h263-";

	private final Map<String, H263Converter> h263Converters = new HashMap<String, H263Converter>();

	private MessagePublisher publisher;

	public void clearH263Converter(String streamName) {
		if (h263Converters.containsKey(streamName)) {
			log.debug("Clearing H263 converter for the stream {}", streamName);
			H263Converter converter = h263Converters.get(streamName);
			converter.stopConverter();
			log.debug("h263Users cleared.");
		} else {
			log.debug("Could not find H263 converter for stream {}",streamName);
		}
	}

	public static boolean isH263Stream(String streamName) {
		return streamName.startsWith(H263PREFIX);
	}

	public void streamPlayItemPlay(ISubscriberStream stream) {
		String streamName = stream.getBroadcastStreamPublishName();
		streamName = streamName.replaceAll(H263PREFIX, "");
		log.debug("Detected H263 stream request [{}]", streamName);

		synchronized (h263Converters) {
			H263Converter converter;
			if (!h263Converters.containsKey(streamName)) {
				String meetingId = (String) Red5.getConnectionLocal().getScope().getName();
				converter = new H263Converter(streamName, meetingId, publisher);
				h263Converters.put(streamName, converter);
			} else {
				converter = h263Converters.get(streamName);
			}
			converter.addListener();
		}
	}

	public void streamSubscriberClose(ISubscriberStream stream) {
		String streamName = stream.getBroadcastStreamPublishName();
		streamName = streamName.replaceAll(H263PREFIX, "");

		synchronized (h263Converters) {
			if (h263Converters.containsKey(streamName)) {
				log.debug("Detected H263 stream close [{}]", streamName);
				H263Converter converter = h263Converters.get(streamName);
				converter.removeListener();
			} else {
				log.warn("Converter not found for H263 stream [{}]. This may has been closed already", streamName);
			}
		}
	}

	public void setMessagePublisher(MessagePublisher publisher) {
		this.publisher = publisher;
	}
}
