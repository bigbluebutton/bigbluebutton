package org.bigbluebutton.api.messaging;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import org.bigbluebutton.api.IReceivedOldMessageHandler;
import org.bigbluebutton.api.messaging.messages.IMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ReceivedMessageHandler implements IReceivedOldMessageHandler {
  private static Logger log = LoggerFactory.getLogger(ReceivedMessageHandler.class);

  private BlockingQueue<ReceivedMessage> receivedMessages = new LinkedBlockingQueue<ReceivedMessage>();

  private volatile boolean processMessage = false;

  private final Executor msgProcessorExec = Executors.newSingleThreadExecutor();
  private final Executor runExec = Executors.newSingleThreadExecutor();

  private MessageDistributor outGW;

  public void stop() {
    processMessage = false;
  }

  public void start() {
    log.info("Ready to handle messages from Redis pubsub!");

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

  private void notifyListeners(IMessage message) {
    outGW.notifyListeners(message);
  }

  private void processMessage(final ReceivedMessage msg) {
    Runnable task = new Runnable() {
      public void run() {
        notifyListeners(msg.getMessage());
      }
    };

    runExec.execute(task);
  }

  public void handleMessage(IMessage message) {
    ReceivedMessage rm = new ReceivedMessage(message);
    receivedMessages.add(rm);
  }

  public void setMessageDistributor(MessageDistributor outGW) {
    this.outGW = outGW;
  }
}
