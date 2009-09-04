/**
 * 
 */
package org.bigbluebutton.conference.service.presentation

import java.util.concurrent.LinkedBlockingQueueimport java.util.concurrent.BlockingQueueimport java.util.concurrent.Executorsimport java.util.concurrent.ExecutorServiceimport java.util.concurrent.RejectedExecutionException
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory
public class ConversionUpdatesProcessor {
	private static Logger log = Red5LoggerFactory.getLogger(ConversionUpdatesProcessor.class, "bigbluebutton");
	
	private BlockingQueue<Map> updatesQueue = new LinkedBlockingQueue<Map>();
	private final ExecutorService exec = Executors.newSingleThreadExecutor();	

	private PresentationApplication presentationApplication
	private volatile boolean processMessage = true
	
	public void process(Map message) {
		updatesQueue.put(message)
	}

	public void start() {
		log.debug "Starting conversion updates processor."
		try {
			// Create a Runnable (Closures implements Runnable) to process the messages.
			def messageProcessor = {	
				log.debug "Waiting for JMS message to process."
				while (processMessage) {
					Map message = (Map) updatesQueue.take()
					log.debug "Processing updates message " + message
						presentationApplication.sendUpdateMessage(message)					
				}
			}
			exec.execute(messageProcessor);				
		} catch (RejectedExecutionException e) {
			if (!exec.isShutdown())
				log.warn("RejectedExecutionException when trying to receive presentaion conversion updates.")
		}	
	}
	
	public void stop() {
		log.debug "Stopping conversion updates processor."
		processMessage = false
		exec.shutdown()
	}
	
	public void setPresentationApplication(PresentationApplication a) {
		log.debug("Setting presentation application")
		presentationApplication = a
	}	
}
