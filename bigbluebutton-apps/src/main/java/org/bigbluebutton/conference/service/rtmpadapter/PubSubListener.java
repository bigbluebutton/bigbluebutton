/** 
* ===License Header===
*
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
* ===License Header===
*/
package org.bigbluebutton.conference.service.rtmpadapter;

import org.red5.compatibility.flex.messaging.io.ArrayCollection;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.adapter.IApplication;
import org.red5.server.adapter.MultiThreadedApplicationAdapter;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.red5.server.api.Red5;
import org.red5.server.api.so.ISharedObject;
import org.slf4j.Logger;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPubSub;

public class PubSubListener extends JedisPubSub {
	
	private static Logger log = Red5LoggerFactory.getLogger(RTMPAdapterApp.class, "bigbluebutton");
	private static final String APP = "RTMPAdapter";
	private Jedis jedis;	
	private ChannelManager channelManager;

	public PubSubListener(ChannelManager channelManager){
		this.channelManager = channelManager;
	}

        public void onMessage(String channel, String message) {
		channelManager.receivedMessage(channel, message);
	}

        public void onSubscribe(String channel, int subscribedChannels) {
        	log.info("PubSubListener subscribing to channel: " + channel + " num channels: " + subscribedChannels);
	}

        public void onUnsubscribe(String channel, int subscribedChannels) {
        }

        public void onPSubscribe(String pattern, int subscribedChannels) {
		log.info("PubSubListener subscribing to: " + pattern + " num channels: " + subscribedChannels);
        }

        public void onPUnsubscribe(String pattern, int subscribedChannels) {
        }

        public void onPMessage(String pattern, String channel,
            String message) {
		channelManager.receivedMessage("pattern message " + channel, message);
        }
}
