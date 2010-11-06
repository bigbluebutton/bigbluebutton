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
package org.bigbluebutton.conference.service.presentation;

import java.util.Map;
import java.util.concurrent.LinkedBlockingQueue;import java.util.concurrent.BlockingQueue;import java.util.concurrent.Executors;import java.util.concurrent.ExecutorService;import java.util.concurrent.RejectedExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.red5.logging.Red5LoggerFactory;
public class ConversionUpdatesProcessor {
	private static Logger log = Red5LoggerFactory.getLogger(ConversionUpdatesProcessor.class, "bigbluebutton");
	
	@SuppressWarnings("unchecked")
	private BlockingQueue<Map> updatesQueue = new LinkedBlockingQueue<Map>();
	private final ExecutorService exec = Executors.newSingleThreadExecutor();	

	private PresentationApplication presentationApplication;
	private volatile boolean processMessage = true;
	
	@SuppressWarnings("unchecked")
	public void process(Map message) {
		try {
			updatesQueue.put(message);
		} catch (InterruptedException e) {
			log.warn(e.getMessage());
		}
	}

	public void start() {
		log.debug("Starting conversion updates processor.");
		try {
			// Create a Runnable (Closures implements Runnable) to process the messages.
			
			exec.execute(new Runnable() {
				
				@SuppressWarnings("unchecked")
				@Override
				public void run() {
					log.debug("Waiting for JMS message to process.");
					while (processMessage) {
						try {
							Map message = (Map) updatesQueue.take();
							log.debug("Processing updates message " + message);
							presentationApplication.sendUpdateMessage(message);
						} catch (InterruptedException e) {
							log.warn(e.getMessage());
						}
					}
				}
			});
			
		} catch (RejectedExecutionException e) {
			if (!exec.isShutdown())
				log.warn("RejectedExecutionException when trying to receive presentaion conversion updates.");
		}	
	}
	
	public void stop() {
		log.debug("Stopping conversion updates processor.");
		processMessage = false;
		exec.shutdown();
	}
	
	public void setPresentationApplication(PresentationApplication a) {
		log.debug("Setting presentation application");
		presentationApplication = a;
	}	
}
