package org.bigbluebutton.webconference;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class BigBlueButton {
	private static Logger log = Red5LoggerFactory.getLogger(BigBlueButton.class, "bigbluebutton");
	
	private BlockingQueue<Message> messages = new LinkedBlockingQueue<Message>();	
	private static final ExecutorService executor = Executors.newSingleThreadExecutor();
	
	private volatile boolean processMessages = false;
	
	public void start() {
		processMessages = true;
		
		executor.execute(new Runnable() {
			public void run() {
				Message msg;
				
				while (processMessages) {
					try {
						msg = messages.take();
						processMessage(msg);
					} catch (InterruptedException e) {
						log.error("InterruptedException while waiting for messages");
						stop();
					}
				}
			}
		});
	}
	
	private void processMessage(Message message) {
		
	}
	
	public void send(Message message) {
		messages.offer(message);
	}
	
	public void stop() {
		processMessages = false;
		executor.shutdown();
	}
}
