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
