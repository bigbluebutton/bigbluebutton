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
        executor = Executors.newSingleThreadExecutor();
    }

    public void handle(IPresentationCompletionMessage msg) {
        messages.offer(msg);
    }

    private void processMessage(IPresentationCompletionMessage msg) {
        if (msg instanceof PresentationConvertMessage) {
            PresentationConvertMessage m = (PresentationConvertMessage) msg;
            PresentationToConvert p = new PresentationToConvert(m.pres);

            String presentationToConvertKey = p.getKey() + "_" + m.pres.getMeetingId();

            presentationsToConvert.put(presentationToConvertKey, p);
        } else if (msg instanceof PageConvertProgressMessage) {
            PageConvertProgressMessage m = (PageConvertProgressMessage) msg;

            log.info("Handling PageConvertProgressMessage for page {}", m.page);

            String presentationToConvertKey = m.presId + "_" + m.meetingId;

            PresentationToConvert p = presentationsToConvert.get(presentationToConvertKey);
            if (p != null) {
                p.incrementPagesCompleted();
                log.info("Finished converting {} out of {}", p.getPagesCompleted(), p.pres.getNumberOfPages());
                notifier.sendConversionUpdateMessage(p.getPagesCompleted(), p.pres, m.page);
                if (p.getPagesCompleted() == p.pres.getNumberOfPages()) {
                    handleEndProcessing(p);
                }
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
                if(meeting.isPresentationConversionCacheEnabled() && !s3FileManager.exists(remoteFileName)) {
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

    public void setSlidesGenerationProgressNotifier(SlidesGenerationProgressNotifier notifier) {
        this.notifier = notifier;
    }

    public void setS3FileManager(S3FileManager s3FileManager) {
        this.s3FileManager = s3FileManager;
    }
}
