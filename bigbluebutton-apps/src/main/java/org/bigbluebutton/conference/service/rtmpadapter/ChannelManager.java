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
import java.util.HashMap;
import java.util.List;
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
import java.lang.Runnable;
import redis.clients.jedis.JedisException;

public class ChannelManager implements Runnable {

	private static Logger log = Red5LoggerFactory.getLogger(RTMPAdapterApp.class, "bigbluebutton");

	private HashMap<String,HashMap<String,ISharedObject>> sharedObjects;
	private RTMPAdapterApp application;
	private PubSubListener pubSubListener;
	private Jedis jedisSub;
	private Jedis jedisPub;
	
	public ChannelManager(RTMPAdapterApp application){
		this.application = application;
		sharedObjects = new HashMap<String, HashMap<String,ISharedObject>>();
		connectToRedis();
	}

	private void connectToRedis(){
		jedisPub = new Jedis("localhost", 6379, 0);
                jedisPub.set("fooPub", "barPub");
	}

	public void run(){
		while(true){
                	jedisSub = new Jedis("localhost", 6379, 0);
                	jedisSub.set("fooSub", "barSub"); //If I remove this before pubsub, jedis will throw an exception.
                	log.info("Subscribing to Redis");
                	pubSubListener = new PubSubListener(this);
                	jedisSub.psubscribe(pubSubListener, "bigbluebutton:*");
		}
	}

	public void subscribe(){
		Thread t = new Thread(this);
		t.start();
	}

	public boolean hasSharedObject(String sharedObjectScope, String appName){
		boolean contains = false;
		if (sharedObjects.containsKey(sharedObjectScope)){
			HashMap<String, ISharedObject> map = sharedObjects.get(sharedObjectScope);
			if (map.containsKey(appName)){
				contains = true;
			}
		}
		return contains;
	}

	public void registerRoom(String sharedObjectScope){
		log.info("RTMPAdapter ChannelManager creating room for scope " + sharedObjectScope);
		sharedObjects.put(sharedObjectScope, new HashMap<String,ISharedObject>());
	}

	public void removeRoom(String sharedObjectScope){
		log.info("RTMPAdapter ChannelManager destroying room for scope " + sharedObjectScope);
		sharedObjects.remove(sharedObjectScope);
	}

	public void registerSharedObject(String sharedObjectScope, String appName, ISharedObject sharedObject){
		if (hasSharedObject(sharedObjectScope, appName)) return;

		log.info("RTMPAdapter ChannelManager requesting room for scope: " + sharedObjectScope);
		HashMap<String, ISharedObject> map = sharedObjects.get(sharedObjectScope);

		map.put(appName, sharedObject);
	}

	public void sendData(String appName, String clientScope, String method, String data){
		log.info("RTMPAdapter sending: bigbluebutton:" + appName + ":" + clientScope + ":" + method + ", data: " + data);
		String channel = "bigbluebutton:" + appName + ":" + clientScope + ":" + method;
		try{
			jedisPub.publish(channel, data);
		} catch(JedisException e){
			connectToRedis();
			jedisPub.publish(channel,data);
		}
	}

	public void receivedMessage(String channel, String message){
		log.info("RTMPAdapter received: " + channel + ", data: " + message);

		String[] parts = channel.split(":");
		String appName = parts[1];
		String sharedObjectScope = parts[2];
		String method = parts[3];
		if (hasSharedObject(sharedObjectScope, appName)){
			ISharedObject sharedObject = sharedObjects.get(sharedObjectScope).get(appName);
			List<String> args = new ArrayList<String>();
			args.add(message);
			sharedObject.sendMessage(method, args);
		}
	}
	
	public void addChannel(String appName, IScope scope){
	}
	
}
