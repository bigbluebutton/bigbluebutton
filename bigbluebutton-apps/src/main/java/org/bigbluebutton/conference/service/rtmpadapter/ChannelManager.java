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

import org.red5.server.api.so.ISharedObject;
import java.util.ArrayList;
import redis.clients.jedis.Jedis;

import org.red5.server.api.IScope;
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

public class ChannelManager {

	private static Logger log = Red5LoggerFactory.getLogger(RTMPAdapterApp.class, "bigbluebutton");

	private ArrayList<ISharedObject> channels;
	private RTMPAdapterApp application;
	private PubSubListener pubSubListener;
	private Jedis jedis;

	public ChannelManager(RTMPAdapterApp application){
		this.application = application;
		channels = new ArrayList<ISharedObject>();

		jedis = new Jedis("localhost:6379");
                pubSubListener = new PubSubListener(this);
                jedis.psubscribe(pubSubListener, "bigbluebutton:");

		pubSubListener = new PubSubListener(this);
	}

	public void sendData(String appName, String clientScope, String method, String data){
		log.info("RTMPAdapter sending: bigbluebutton:" + appName + ":" + clientScope + ":" + method + ", data: " + data);
		String channel = "bigbluebutton:" + appName + ":" + clientScope + ":" + method;
		jedis.publish(channel, data);
	}

	public void receivedMessage(String channel, String message){
		log.info("RTMPAdapter received: " + channel + ", data: " + message);
	}
	
	public void addChannel(String appName, IScope scope){
	}
	
}
