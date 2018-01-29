package org.bigbluebutton.red5.pubsub;


import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

public class ReceivedMessageHandler {
    private static Logger log = Red5LoggerFactory.getLogger(ReceivedMessageHandler.class, "video");

    private BlockingQueue<ReceivedMessage> receivedMessages = new LinkedBlockingQueue<ReceivedMessage>();

    private volatile boolean processMessage = false;

    private final Executor msgProcessorExec = Executors.newSingleThreadExecutor();
    private final Executor runExec = Executors.newSingleThreadExecutor();

    private MessageDistributor handler;

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

    private void processMessage(final ReceivedMessage msg) {
        Runnable task = new Runnable() {
            public void run() {
                if (handler != null) {
                    handler.notifyListeners(msg.getPattern(), msg.getChannel(), msg.getMessage());
                } else {
                    log.warn("No listeners interested in messages from Redis!");
                }
            }
        };

        runExec.execute(task);
    }

    public void handleMessage(String pattern, String channel, String message) {
        ReceivedMessage rm = new ReceivedMessage(pattern, channel, message);
        receivedMessages.add(rm);
    }

    public void setMessageDistributor(MessageDistributor h) {
        this.handler = h;
    }
}
