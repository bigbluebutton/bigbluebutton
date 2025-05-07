package org.bigbluebutton.presentation.imp;

import com.google.gson.Gson;
import org.bigbluebutton.api.domain.Meeting;
import org.bigbluebutton.api.service.ServiceUtils;
import org.bigbluebutton.presentation.messages.IPresentationCompletionMessage;
import org.bigbluebutton.presentation.messages.PageConvertProgressMessage;
import org.bigbluebutton.presentation.messages.PresentationConvertMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.*;

public class PresentationConversionCompletionService {
    private static Logger log = LoggerFactory.getLogger(PresentationConversionCompletionService.class);

    private SlidesGenerationProgressNotifier notifier;
    private S3FileManager s3FileManager;

    private ExecutorService executor;
    private volatile boolean processProgress = false;

    private final ConcurrentMap<String, PresentationToConvert> presentationsToConvert
            = new ConcurrentHashMap<String, PresentationToConvert>();

    private BlockingQueue<IPresentationCompletionMessage> messages = new LinkedBlockingQueue<IPresentationCompletionMessage>();

    public PresentationConversionCompletionService() {
        executor = Executors.newSingleThreadExecutor(r -> {
            Thread t = new Thread(r, "conv-msg-consumer");
            t.setUncaughtExceptionHandler((thr, ex) ->
                    log.error("Uncaught exception in {}", thr.getName(), ex)
            );
            return t;
        });
    }

    public void handle(IPresentationCompletionMessage msg) {
        log.info("Enqueueing presentation conversion message");
        boolean added = messages.offer(msg);
        if (!added) {
            log.warn("Conversion message was not added to the queue");
        }
    }

    private void processMessage(IPresentationCompletionMessage msg) {
        if (msg instanceof PresentationConvertMessage) {
            log.info("Handling PresentationConvertMessage");
            PresentationConvertMessage m = (PresentationConvertMessage) msg;
            PresentationToConvert p = new PresentationToConvert(m.pres);

            String presentationToConvertKey = p.getKey() + "_" + m.pres.getMeetingId();

            log.info("Storing presentation with key {}", presentationToConvertKey);
            presentationsToConvert.put(presentationToConvertKey, p);
        } else if (msg instanceof PageConvertProgressMessage) {
            log.info("Handling PageConvertProgressMessage");
            PageConvertProgressMessage m = (PageConvertProgressMessage) msg;
            String presentationToConvertKey = m.presId + "_" + m.meetingId;

            PresentationToConvert p = presentationsToConvert.get(presentationToConvertKey);
            if (p != null) {
                log.info("Found presentation with key {}", presentationToConvertKey);
                p.incrementPagesCompleted();
                notifier.sendConversionUpdateMessage(p.getPagesCompleted(), p.pres, m.page);
                log.info("{} of {} pages successfully converted for presentation [{}] in meeting [{}]", p.getPagesCompleted(), p.pres.getNumberOfPages(),
                        ((PageConvertProgressMessage) msg).presId, ((PageConvertProgressMessage) msg).meetingId);
                if (p.getPagesCompleted() == p.pres.getNumberOfPages()) {
                    log.info("Last presentation page converted");
                    handleEndProcessing(p);
                }
            } else {
                log.error("No presentation found with key {}", presentationToConvertKey);
            }
        }
    }

    private void handleEndProcessing(PresentationToConvert p) {
        String presentationToConvertKey = p.getKey() + "_" + p.pres.getMeetingId();

        presentationsToConvert.remove(presentationToConvertKey);

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

        String meetingId = p.pres.getMeetingId();
        //Store presentation outputs in cache (if enabled)
        if(!p.pres.getUploadedFileHash().isEmpty()) {
            try {
                String remoteFileName = p.pres.getUploadedFileHash() + ".tar.gz";
                Meeting meeting = ServiceUtils.findMeetingFromMeetingID(meetingId);
                if(meeting != null && meeting.isPresentationConversionCacheEnabled() && !s3FileManager.exists(remoteFileName)) {
                    File parentDir = new File(p.pres.getUploadedFile().getParent());
                    File compressedFile = TarGzManager.compress(
                            parentDir.getAbsolutePath(),
                            p.pres.getUploadedFileHash(),
                            p.pres.getNumberOfPages()
                    );
                    s3FileManager.upload(remoteFileName, compressedFile);
                    log.info("Presentation outputs stored into cache successfully for {}.", p.pres.getId());
                }
            } catch (Exception e) {
                log.error("Error while storing presentations outputs into cache: {}", e.getMessage());
            }
        }

        // Remove pdf of each page (it was necessary just during conversions)
        String presDir = p.pres.getUploadedFile().getParent();
        for (int page = 1; page <= p.pres.getNumberOfPages(); page++) {
            File pageFile = new File(presDir + "/page" + "-" + page + ".pdf");
            if(pageFile.exists()) {
                pageFile.delete();
            }
        }
    }
    public void start() {
        log.info("Ready to process presentation files!");

        try {
            processProgress = true;
            executor.submit(() -> {
                while (processProgress) {
                    try {
                        log.info("Taking next presentation conversion message");
                        IPresentationCompletionMessage msg = messages.take();
                        processMessage(msg);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    } catch (Throwable t) {
                        log.error("Conversion message consumer encountered an error but will continue", t);
                    }
                }
                log.info("Conversion message consumer thread exiting");
            });
        } catch (Exception e) {
            log.error("Error processing presentation file:", e);
        }
    }

    public void stop() {
        processProgress = false;
    }

    public void setSlidesGenerationProgressNotifier(SlidesGenerationProgressNotifier notifier) {
        this.notifier = notifier;
    }

    public void setS3FileManager(S3FileManager s3FileManager) {
        this.s3FileManager = s3FileManager;
    }
}
