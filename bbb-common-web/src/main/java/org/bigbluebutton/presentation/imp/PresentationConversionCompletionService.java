package org.bigbluebutton.presentation.imp;

import com.google.gson.Gson;
import org.bigbluebutton.presentation.messages.IPresentationCompletionMessage;
import org.bigbluebutton.presentation.messages.PageConvertProgressMessage;
import org.bigbluebutton.presentation.messages.PresentationConvertMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.*;

public class PresentationConversionCompletionService {
    private static Logger log = LoggerFactory.getLogger(PresentationConversionCompletionService.class);

    private SwfSlidesGenerationProgressNotifier notifier;

    private ExecutorService executor;
    private volatile boolean processProgress = false;

    private final ConcurrentMap<String, PresentationToConvert> presentationsToConvert
            = new ConcurrentHashMap<String, PresentationToConvert>();

    private BlockingQueue<IPresentationCompletionMessage> messages = new LinkedBlockingQueue<IPresentationCompletionMessage>();

    public PresentationConversionCompletionService() {
        executor = Executors.newSingleThreadExecutor();
    }

    public void handle(IPresentationCompletionMessage msg) {
        messages.offer(msg);
    }

    private void processMessage(IPresentationCompletionMessage msg) {
        if (msg instanceof PresentationConvertMessage) {
            PresentationConvertMessage m = (PresentationConvertMessage) msg;
            PresentationToConvert p = new PresentationToConvert(m.pres);
            presentationsToConvert.put(p.getKey(), p);
        } else if (msg instanceof PageConvertProgressMessage) {

            PageConvertProgressMessage m = (PageConvertProgressMessage) msg;
            PresentationToConvert p = presentationsToConvert.get(m.presId);
            if (p != null) {
                p.incrementPagesCompleted();
                notifier.sendConversionUpdateMessage(p.getPagesCompleted(), p.pres, m.page);
                if (p.getPagesCompleted() == p.pres.getNumberOfPages()) {
                    handleEndProcessing(p);
                }
            }
        }
    }

    private void handleEndProcessing(PresentationToConvert p) {
        presentationsToConvert.remove(p.getKey());

        Map<String, Object> logData = new HashMap<String, Object>();
        logData = new HashMap<String, Object>();
        logData.put("podId", p.pres.getPodId());
        logData.put("meetingId", p.pres.getMeetingId());
        logData.put("presId", p.pres.getId());
        logData.put("filename", p.pres.getName());
        logData.put("current", p.pres.isCurrent());
        logData.put("logCode", "presentation_conversion_end");
        logData.put("message", "End presentation conversion.");

        Gson gson = new Gson();
        String logStr = gson.toJson(logData);
        log.info(" --analytics-- data={}", logStr);

        notifier.sendConversionCompletedMessage(p.pres);
    }
    public void start() {
        log.info("Ready to process presentation files!");

        try {
            processProgress = true;

            Runnable messageProcessor = new Runnable() {
                public void run() {
                    while (processProgress) {
                        try {
                            IPresentationCompletionMessage msg = messages.take();
                            processMessage(msg);
                        } catch (InterruptedException e) {
                            log.warn("Error while taking presentation file from queue.");
                        }
                    }
                }
            };
            executor.submit(messageProcessor);
        } catch (Exception e) {
            log.error("Error processing presentation file: {}", e);
        }
    }

    public void stop() {
        processProgress = false;
    }

    public void setSwfSlidesGenerationProgressNotifier(SwfSlidesGenerationProgressNotifier notifier) {
        this.notifier = notifier;
    }
}
