package org.bigbluebutton.app.screenshare.events;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.Set;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class EventMessageBusImp implements IEventsMessageBus {
  private static Logger log = Red5LoggerFactory.getLogger(EventMessageBusImp.class, "screenshare");

  private BlockingQueue<IEvent> receivedMessages = new LinkedBlockingQueue<IEvent>();
  private volatile boolean processMessage = false;
  private final Executor msgProcessorExec = Executors.newSingleThreadExecutor();
  private int maxThreshold = 1024;
  private Set<IEventListener> listeners;

  public void send(IEvent msg) {
    if (receivedMessages.size() > maxThreshold) {
      log.warn("Queued number of events [{}] is greater than threshold [{}]", receivedMessages.size(), maxThreshold);
    }
    receivedMessages.add(msg);
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
              IEvent msg = receivedMessages.take();
              processMessage(msg);
            } catch (InterruptedException e) {
              log.warn("Error while taking received message from queue.");
            }                           
          }
        }
      };
      msgProcessorExec.execute(messageProcessor);
    } catch (Exception e) {
      log.error("Error processing event: " + e.getMessage());
    }           
  }

  private void processMessage(final IEvent msg) {
    for (IEventListener listener : listeners) {
      listener.handleMessage(msg);
    }
  }

  public void setListeners(Set<IEventListener> listeners) {
    this.listeners = listeners;
  }

  public void setMaxThreshold(int threshold) {
    maxThreshold = threshold;
  }

}
