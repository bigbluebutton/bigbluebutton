/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
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

package org.bigbluebutton.web.services;

import org.bigbluebutton.api.messaging.MessageListener;
import org.bigbluebutton.api.messaging.MessagingService;
import org.bigbluebutton.api.messaging.MessagingConstants;
import org.bigbluebutton.api.messaging.RedisMessagingService;
import org.bigbluebutton.api.messaging.messages.IMessage;
import org.bigbluebutton.api.messaging.messages.KeepAliveReply;
import org.bigbluebutton.api.messaging.messages.MeetingDestroyed;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Timer;
import java.util.TimerTask;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import com.google.gson.Gson;

public class KeepAliveService implements MessageListener {
	private static Logger log = LoggerFactory.getLogger(KeepAliveService.class);
	private final String KEEP_ALIVE_REQUEST = "KEEP_ALIVE_REQUEST";
	private MessagingService service;
	private long runEvery = 10000;
	private int maxLives = 5;
	private KeepAliveTask task = new KeepAliveTask();
	private volatile boolean processMessages = false;
	private ArrayList<String> pingMessages = new ArrayList<String>();
	volatile boolean available = false;
	
	private static final Executor msgSenderExec = Executors.newFixedThreadPool(1);
	private static final Executor runExec = Executors.newFixedThreadPool(1);
	
	private ScheduledExecutorService scheduledThreadPool = Executors.newScheduledThreadPool(1);
	
	private BlockingQueue<KeepAliveMessage> messages = new LinkedBlockingQueue<KeepAliveMessage>();
	
	public void start() {	
		scheduledThreadPool.scheduleWithFixedDelay(task, 5000, runEvery, TimeUnit.MILLISECONDS);
		processKeepAliveMessage();
	}
	
	public void stop() {
		processMessages = false;
		scheduledThreadPool.shutdownNow();
	}
	
	public void setRunEvery(long v) {
		runEvery = v * 1000;
	}

	public void setMessagingService(MessagingService service){
		this.service = service;
	}
	
	class KeepAliveTask implements Runnable {
    public void run() {
     	String aliveId = Long.toString(System.currentTimeMillis());
     	KeepAlivePing ping = new KeepAlivePing(aliveId);
     	queueMessage(ping);
    }
  }

  public boolean isDown(){
  	return !available;
  }
    
  private void queueMessage(KeepAliveMessage msg) {
		  messages.add(msg);
  }
    
  private void processKeepAliveMessage() {
  	processMessages = true;
  	Runnable sender = new Runnable() {
  		public void run() {
  			while (processMessages) {
  				KeepAliveMessage message;
  				try {
  					message = messages.take();
  					processMessage(message);	
  				} catch (InterruptedException e) {
  					// TODO Auto-generated catch block
  					e.printStackTrace();
  				}	catch (Exception e) {
  					log.error("Catching exception [{}]", e.toString());
  				}
  			}
  		}
  	};
  	msgSenderExec.execute(sender);		
  } 
  	
  private void processMessage(final KeepAliveMessage msg) {
  	Runnable task = new Runnable() {
  		public void run() {
  	  	if (msg instanceof KeepAlivePing) {
  	  		processPing((KeepAlivePing) msg);
  	  	} else if (msg instanceof KeepAlivePong) {
  	  		processPong((KeepAlivePong) msg);
  	  	}  			
  		}
  	};
  	
    runExec.execute(task);
  }
  	
  private void processPing(KeepAlivePing msg) {
   	if (pingMessages.size() < maxLives) {
     	pingMessages.add(msg.getId());
//     	log.debug("Sending keep alive message to bbb-apps. keep-alive id [{}]", msg.getId());
     	service.sendKeepAlive(msg.getId());
   	} else {
   		// BBB-Apps has gone down. Mark it as unavailable and clear
   		// pending ping messages. This allows us to continue to send ping messages
   		// in case BBB-Apps comes back up. (ralam - april 29, 2014)
   		available = false;
   		pingMessages.clear();
   		log.warn("bbb-apps is down!");
   	}  		
  }
  	
  private void processPong(KeepAlivePong msg) {
   	boolean found = false;

   	for (int count = 0; count < pingMessages.size(); count++){
   		if (pingMessages.get(count).equals(msg.getId())){
   			pingMessages.remove(count);
   			if (!available) {
   				available = true;
   				removeOldPingMessages(msg.getId());
//   			  log.info("Received Keep Alive Reply. BBB-Apps has recovered.");
   			}
 //  			log.debug("Found ping message [" + msg.getId() + "]");
   			found = true;
   			break;
   		}
   	}
   	if (!found){
   		log.info("Received invalid keep alive response from bbb-apps:" + msg.getId());
   	}  		
  }

  private void removeOldPingMessages(String pingId) {
  	long ts = Long.parseLong(pingId);
  	for (int i = 0; i < pingMessages.size(); i++) {
  		String pm = pingMessages.get(i);
  		if (ts > Long.parseLong(pm)) {
  			// Old ping message. Remove it. This might be
  			// ping sent when Red5 was down or restarted.
  		  pingMessages.remove(i);
  		}
  	}
  }
  
  private void keepAliveReply(String aliveId) {
   	log.debug("Received keep alive msg reply from bbb-apps. id [{}]", aliveId);
   	KeepAlivePong pong = new KeepAlivePong(aliveId);
   	queueMessage(pong);
  }
  
	@Override
  public void handle(IMessage message) {
		if (message instanceof KeepAliveReply) {
			KeepAliveReply msg = (KeepAliveReply) message;
			keepAliveReply(msg.pongId);
		}
  }
}