package org.bigbluebutton.core;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import org.bigbluebutton.core.api.IBigBlueButtonGateway;
import org.bigbluebutton.core.messages.*;

public class BigBlueButton {
	private static final Executor exec = Executors.newSingleThreadExecutor();
			
	private BlockingQueue<Message> messages;
	private volatile boolean sendMessages = false;
	private IBigBlueButtonGateway gw;
	
	public BigBlueButton() {
		messages = new LinkedBlockingQueue<Message>();
	}
	
	public void start() {
		sendMessages = true;
		Runnable sender = new Runnable() {
			public void run() {
				while (sendMessages) {
					Message message;
					try {
						message = messages.take();
						sendMessage(message);	
					} catch (InterruptedException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}									
				}
			}
		};
		exec.execute(sender);		
	}
	
	private void sendMessage(Message message) {
		
	}
	
	public void send(Message message) {
		messages.add(message);
	}
	
	public void stop() {
		sendMessages = false;
	}
	
	public void setBigBlueButtonGateway(IBigBlueButtonGateway gw) {
		this.gw = gw;
	}
}
