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

import java.util.regex.Matcher;
import java.util.regex.Pattern;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.flazr.rtmp.client.ClientOptions;
import com.flazr.rtmp.message.Video;
import com.flazr.util.Utils;

public class VideoProxyReceiver {

	protected class VideoConnection extends VideoProxyReceiverConnection {

		public VideoConnection(ClientOptions options) {
			super(options);
		}

		@Override
		protected void onVideo(Video video) {
			VideoProxyReceiver.this.onVideo(video);
		}
		
	}
	
	private static final Logger log = LoggerFactory.getLogger(VideoProxyReceiver.class);

	private String streamName;
	private VideoConnection videoConnection;
	private VideoRtmpReader reader;
	
	public VideoProxyReceiver(String host, String appPath, String conference, String streamName, VideoRtmpReader reader) {
		System.out.println("INIT");
		ClientOptions opt = new ClientOptions();
		opt.setClientVersionToUse(Utils.fromHex("00000000"));
		opt.setHost(host);
		opt.setAppName(appPath + "/" + conference);
		this.reader = reader;
		this.streamName = streamName;

		opt.setWriterToSave(null);
		opt.setStreamName(streamName);
		
		videoConnection = new VideoConnection(opt);
		System.out.println("COMP");
	}
	
	protected void onVideo(Video video) {
		//Retransmit video package
		//Received Video
		//reader.addFrame(video);
		//System.out.println("Received Video data " + video.getHeader().getTime());
		log.debug("received video package: {}", video.getHeader().getTime());
	}
	
	public void start() {
		if (videoConnection != null)
			videoConnection.connect();
	}
	
	public void stop() {
		if (videoConnection != null)
			videoConnection.disconnect();
	}

	
	public String getStreamName() {
		return streamName;
	}
	
	
}
