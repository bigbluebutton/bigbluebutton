/*
 * GT-Mconf: Multiconference system for interoperable web and mobile
 * http://www.inf.ufrgs.br/prav/gtmconf
 * PRAV Labs - UFRGS
 * 
 * This file is part of Mconf-Mobile.
 *
 * Mconf-Mobile is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Mconf-Mobile is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Mconf-Mobile.  If not, see <http://www.gnu.org/licenses/>.
 */

package org.bigbluebutton.app.videoproxy;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.flazr.rtmp.RtmpReader;
import com.flazr.rtmp.client.ClientOptions;
import com.flazr.util.Utils;


public class VideoProxyPublisher {
	private static final Logger log = LoggerFactory.getLogger(VideoProxyPublisher.class);

	private VideoProxyPublisherConnection videoConnection = null;
	private String streamName;
	private ClientOptions opt;
//	private RtmpReader reader;
	
	public VideoProxyPublisher(String host, String app, String conference, RtmpReader reader, String streamName) {
		this.streamName = streamName;
		opt = new ClientOptions();
		opt.setClientVersionToUse(Utils.fromHex("00000000"));
		opt.setHost(host);
		opt.setAppName(app + "/" + conference);
		opt.publishLive();
		opt.setStreamName(streamName);
		opt.setReaderToPublish(reader);
	}
	
	public void setLoop(boolean loop) {
		opt.setLoop(loop? Integer.MAX_VALUE: 0);
	}
	
	public void start() {
		if (videoConnection == null) {
			videoConnection = new VideoProxyPublisherConnection(opt);
			videoConnection.connect();
		}
	}
	
	public void stop() {
		videoConnection.disconnect();
	}

	public void fireFirstFrame() {
		if (videoConnection != null) {
			videoConnection.publisher.fireNext(videoConnection.publisher.channel, 0);
		}
	}
}
