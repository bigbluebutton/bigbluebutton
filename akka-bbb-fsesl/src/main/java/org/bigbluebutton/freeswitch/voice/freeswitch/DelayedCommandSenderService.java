package org.bigbluebutton.freeswitch.voice.freeswitch;

import org.bigbluebutton.freeswitch.voice.freeswitch.actions.DelayedCommand;
import org.bigbluebutton.freeswitch.voice.freeswitch.actions.FreeswitchCommand;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.DelayQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

public class DelayedCommandSenderService {
  private static Logger log = LoggerFactory.getLogger(DelayedCommandSenderService.class);

  private BlockingQueue<DelayedCommand> receivedMessages = new DelayQueue<DelayedCommand>();

  private volatile boolean processMessage = false;

  private final Executor msgProcessorExec = Executors.newSingleThreadExecutor();

  private IDelayedCommandListener listener;

  public void setDelayedCommandListener(IDelayedCommandListener listener) {
    this.listener = listener;
  }

  public void stop() {
    log.info("Stopping DelayedCommandSenderService.");
    processMessage = false;
  }

  public void start() {
    log.info("Starting DelayedCommandSenderService.");
    try {
      processMessage = true;

      Runnable messageProcessor = new Runnable() {
        public void run() {
          while (processMessage) {
            try {
              DelayedCommand msg = receivedMessages.take();
              log.info("Scheduling DelayedCommand.");
              if (listener != null) {
                listener.runDelayedCommand(msg.conferenceCommand);
              }
            } catch (InterruptedException e) {
              log.error("Error while taking received message from queue.");
            }
          }
        }
      };
      msgProcessorExec.execute(messageProcessor);
    } catch (Exception e) {
      log.error("Error subscribing to channels: " + e);
    }
  }

  public void handleMessage(FreeswitchCommand command, long delayInMillis) {
    log.info("Queueing DelayedCommand.");
    DelayedCommand dc = new DelayedCommand(command, delayInMillis);
    receivedMessages.add(dc);
  }
}
