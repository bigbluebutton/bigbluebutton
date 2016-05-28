package org.bigbluebutton.core.pubsub.receivers;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RedisMessageReceiver {
  private static final Logger log = LoggerFactory.getLogger(RedisMessageReceiver.class);
  
  private BlockingQueue<ReceivedMessage> receivedMessages = new LinkedBlockingQueue<ReceivedMessage>();
  
  private volatile boolean processMessage = false;
  
  private final Executor msgProcessorExec = Executors.newSingleThreadExecutor();
  private final Executor runExec = Executors.newSingleThreadExecutor();
  
	private List<MessageHandler> receivers;
	private IBigBlueButtonInGW bbbGW;
	
	public RedisMessageReceiver(IBigBlueButtonInGW bbbGW) {
		this.bbbGW = bbbGW;
		receivers = new ArrayList<MessageHandler>();
		setupReceivers();
		start();
	}
	
	private void setupReceivers() {
		ChatMessageReceiver chatRx = new ChatMessageReceiver(bbbGW);
		receivers.add(chatRx);
		
		LockMessageReceiver lockRx = new LockMessageReceiver(bbbGW);
		receivers.add(lockRx);
		
		PresentationMessageListener presRx = new PresentationMessageListener(bbbGW);
		receivers.add(presRx);
		
		UsersMessageReceiver usersRx = new UsersMessageReceiver(bbbGW);
		receivers.add(usersRx);
				
		WhiteboardMessageReceiver whiteboardRx = new WhiteboardMessageReceiver(bbbGW);
		receivers.add(whiteboardRx);

		DeskShareMessageReceiver deskShareRx = new DeskShareMessageReceiver(bbbGW);
		receivers.add(deskShareRx);

		PollingMessageReceiver pollRx = new PollingMessageReceiver(bbbGW);
		receivers.add(pollRx);

		MeetingMessageReceiver meetingRx = new MeetingMessageReceiver(bbbGW);
		receivers.add(meetingRx);
		
		CaptionMessageReceiver captionRx = new CaptionMessageReceiver(bbbGW);
		receivers.add(captionRx);
	}
	
	public void handleMessage(String pattern, String channel, String message) {
    ReceivedMessage rm = new ReceivedMessage(pattern, channel, message);
    receivedMessages.add(rm);
	}
	
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
	              ReceivedMessage msg = receivedMessages.take();
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
	  
	  private void processMessage(final ReceivedMessage msg) {
	    Runnable task = new Runnable() {
	      public void run() {
	          for (MessageHandler l : receivers) {
	            l.handleMessage(msg.getPattern(), msg.getChannel(), msg.getMessage());
	          }      
	      }
	    };
	    runExec.execute(task);
	  }
}
