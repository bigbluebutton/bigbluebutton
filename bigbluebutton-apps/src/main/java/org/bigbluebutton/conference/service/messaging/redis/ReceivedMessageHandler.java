package org.bigbluebutton.conference.service.messaging.redis;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class ReceivedMessageHandler {
	private static Logger log = Red5LoggerFactory.getLogger(ReceivedMessageHandler.class, "bigbluebutton");
	
	private BlockingQueue<ReceivedMessage> receivedMessages = new LinkedBlockingQueue<ReceivedMessage>();
	
	private volatile boolean processMessage = false;
	
	private final Executor msgProcessorExec = Executors.newSingleThreadExecutor();
	private BlockingQueue<ReceivedMessage> messages = new LinkedBlockingQueue<ReceivedMessage>();
	
	private MessageDistributor handler;
	
	public void stop() {
		processMessage = false;
	}
	
	public void start() {	
		try {
			processMessage = true;
			
			Runnable messageProcessor = new Runnable() {
			    public void run() {
			    	while (processMessage) {
			    		try {
							ReceivedMessage msg = messages.take();
							processMessage(msg);
						} catch (InterruptedException e) {
							log.warn("Error while taking received message from queue.");
						}   			    		
			    	}
			    }
			};
			msgProcessorExec.execute(messageProcessor);
		} catch (Exception e) {
			log.error("Error subscribing to channels: " + e.getMessage());
		}			
	}
	
	private void processMessage(ReceivedMessage msg) {
		if (handler != null) {
			handler.notifyListeners(msg.getPattern(), msg.getChannel(), msg.getMessage());
		}
	}
	
	public void handleMessage(String pattern, String channel, String message) {
		ReceivedMessage rm = new ReceivedMessage(pattern, channel, message);
		receivedMessages.add(rm);
	}
	
	public void setMessageDistributor(MessageDistributor h) {
		this.handler = h;
	}
}
