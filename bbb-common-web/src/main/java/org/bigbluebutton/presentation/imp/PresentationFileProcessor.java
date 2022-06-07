package org.bigbluebutton.presentation.imp;

import com.google.gson.Gson;
import org.bigbluebutton.api.Util;
import org.bigbluebutton.presentation.*;
import org.bigbluebutton.presentation.messages.DocPageConversionStarted;
import org.bigbluebutton.presentation.messages.DocPageCountExceeded;
import org.bigbluebutton.presentation.messages.DocPageCountFailed;
import org.bigbluebutton.presentation.messages.PresentationConvertMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

public class PresentationFileProcessor {
    private static Logger log = LoggerFactory.getLogger(PresentationFileProcessor.class);

    private boolean swfSlidesRequired;
    private boolean svgImagesRequired;
    private boolean generatePngs;
    private PageExtractor pageExtractor;

    private String BLANK_SLIDE;
    private int MAX_SWF_FILE_SIZE;
    private long bigPdfSize;
    private long maxBigPdfPageSize;

    private long MAX_CONVERSION_TIME = 5 * 60 * 1000L;

    private TextFileCreator textFileCreator;
    private SvgImageCreator svgImageCreator;
    private ThumbnailCreator thumbnailCreator;
    private PngCreator pngCreator;
    private PageConverter pdfToSwfConverter;
    private SwfSlidesGenerationProgressNotifier notifier;
    private PageCounterService counterService;
    private PresentationConversionCompletionService presentationConversionCompletionService;
    private ImageToSwfSlidesGenerationService imageToSwfSlidesGenerationService;
    private PdfToSwfSlidesGenerationService pdfToSwfSlidesGenerationService;

    private ExecutorService executor;
    private volatile boolean processPresentation = false;

    private BlockingQueue<UploadedPresentation> presentations = new LinkedBlockingQueue<UploadedPresentation>();

    public PresentationFileProcessor(int numConversionThreads) {
        executor = Executors.newFixedThreadPool(numConversionThreads);
    }

    public synchronized void process(UploadedPresentation pres) {
        if (pres.isDownloadable()) {
            processMakePresentationDownloadableMsg(pres);
        }

        Runnable messageProcessor = new Runnable() {
            public void run() {
                processUploadedPresentation(pres);
            }
        };
        executor.submit(messageProcessor);
    }

    private void processMakePresentationDownloadableMsg(UploadedPresentation pres) {
        try {
            File presentationFileDir = pres.getUploadedFile().getParentFile();
            Util.makePresentationDownloadable(presentationFileDir, pres.getId(), pres.isDownloadable());
        } catch (IOException e) {
            log.error("Failed to make presentation downloadable: {}", e);
        }
    }

    private void processUploadedPresentation(UploadedPresentation pres) {
        if (SupportedFileTypes.isPdfFile(pres.getFileType())) {
            determineNumberOfPages(pres);
            sendDocPageConversionStartedProgress(pres);
            PresentationConvertMessage msg = new PresentationConvertMessage(pres);
            presentationConversionCompletionService.handle(msg);
            extractIntoPages(pres);
        } else if (SupportedFileTypes.isImageFile(pres.getFileType())) {
            pres.setNumberOfPages(1); // There should be only one image to convert.
            sendDocPageConversionStartedProgress(pres);
            imageToSwfSlidesGenerationService.generateSlides(pres);
        }
    }

    private void extractIntoPages(UploadedPresentation pres) {
        for (int page = 1; page <= pres.getNumberOfPages(); page++) {
            String presDir = pres.getUploadedFile().getParent();
            File pageFile = new File(presDir + "/page" + "-" + page + ".pdf");

            File extractedPageFile = extractPage(pres, page);

            if (extractedPageFile.length() > maxBigPdfPageSize) {
                File downscaledPageFile = downscalePage(pres, extractedPageFile, page);
                downscaledPageFile.renameTo(pageFile);
                extractedPageFile.delete();
            } else {
                extractedPageFile.renameTo(pageFile);
            }

            PageToConvert pageToConvert = new PageToConvert(
                    pres,
                    page,
                    pageFile,
                    swfSlidesRequired,
                    svgImagesRequired,
                    generatePngs,
                    textFileCreator,
                    svgImageCreator,
                    thumbnailCreator,
                    pngCreator,
                    pdfToSwfConverter,
                    notifier,
                    BLANK_SLIDE,
                    MAX_SWF_FILE_SIZE
            );

            pdfToSwfSlidesGenerationService.process(pageToConvert);
        }
    }

    private File downscalePage(UploadedPresentation pres, File filePage, int pageNum) {
        String presDir = pres.getUploadedFile().getParent();
        File tempPage = new File(presDir + "/downscaled" + "-" + pageNum + ".pdf");
        PdfPageDownscaler downscaler = new PdfPageDownscaler();
        downscaler.downscale(filePage, tempPage);
        if (tempPage.exists()) {
            return tempPage;
        }

        return filePage;
    }

    private File extractPage(UploadedPresentation pres, int page) {
        String presDir = pres.getUploadedFile().getParent();

        File tempPage = new File(presDir + "/extracted" + "-" + page + ".pdf");
        pageExtractor.extractPage(pres.getUploadedFile(), tempPage, page);

        return tempPage;
    }

    private boolean determineNumberOfPages(UploadedPresentation pres) {
        try {
            counterService.determineNumberOfPages(pres);
            return true;
        } catch (CountingPageException e) {
            sendFailedToCountPageMessage(e, pres);
        }
        return false;
    }

    private void sendDocPageConversionStartedProgress(UploadedPresentation pres) {
        Map<String, Object> logData = new HashMap<String, Object>();

        logData.put("podId", pres.getPodId());
        logData.put("meetingId", pres.getMeetingId());
        logData.put("presId", pres.getId());
        logData.put("filename", pres.getName());
        logData.put("num_pages", pres.getNumberOfPages());
        logData.put("authzToken", pres.getAuthzToken());
        logData.put("logCode", "presentation_conversion_num_pages");
        logData.put("message", "Presentation conversion number of pages.");

        Gson gson = new Gson();
        String logStr = gson.toJson(logData);
        log.info(" --analytics-- data={}", logStr);

        DocPageConversionStarted progress = new DocPageConversionStarted(
                pres.getPodId(),
                pres.getMeetingId(),
                pres.getId(),
                pres.getName(),
                pres.getAuthzToken(),
                pres.isDownloadable(),
                pres.isCurrent(),
                pres.getNumberOfPages());
        notifier.sendDocConversionProgress(progress);
    }

    private void sendFailedToCountPageMessage(CountingPageException e, UploadedPresentation pres) {
        ConversionUpdateMessage.MessageBuilder builder = new ConversionUpdateMessage.MessageBuilder(pres);

        if (e.getExceptionType() == CountingPageException.ExceptionType.PAGE_COUNT_EXCEPTION) {
            builder.messageKey(ConversionMessageConstants.PAGE_COUNT_FAILED_KEY);

            Map<String, Object> logData = new HashMap<>();
            logData.put("podId", pres.getPodId());
            logData.put("meetingId", pres.getMeetingId());
            logData.put("presId", pres.getId());
            logData.put("filename", pres.getName());
            logData.put("logCode", "determine_num_pages_failed");
            logData.put("message", "Failed to determine number of pages.");
            Gson gson = new Gson();
            String logStr = gson.toJson(logData);
            log.error(" --analytics-- data={}", logStr, e);

            DocPageCountFailed progress = new DocPageCountFailed(pres.getPodId(), pres.getMeetingId(),
                    pres.getId(), pres.getId(),
                    pres.getName(), "notUsedYet", "notUsedYet",
                    pres.isDownloadable(), ConversionMessageConstants.PAGE_COUNT_FAILED_KEY);

            notifier.sendDocConversionProgress(progress);

        } else if (e.getExceptionType() == CountingPageException.ExceptionType.PAGE_EXCEEDED_EXCEPTION) {
            builder.numberOfPages(e.getPageCount());
            builder.maxNumberPages(e.getMaxNumberOfPages());
            builder.messageKey(ConversionMessageConstants.PAGE_COUNT_EXCEEDED_KEY);

            Map<String, Object> logData = new HashMap<String, Object>();
            logData.put("podId", pres.getPodId());
            logData.put("meetingId", pres.getMeetingId());
            logData.put("presId", pres.getId());
            logData.put("filename", pres.getName());
            logData.put("pageCount", e.getPageCount());
            logData.put("maxNumPages", e.getMaxNumberOfPages());
            logData.put("logCode", "num_pages_exceeded");
            logData.put("message", "Number of pages exceeded.");
            Gson gson = new Gson();
            String logStr = gson.toJson(logData);
            log.warn(" --analytics-- data={}", logStr);

            DocPageCountExceeded progress = new DocPageCountExceeded(pres.getPodId(), pres.getMeetingId(),
                    pres.getId(), pres.getId(),
                    pres.getName(), "notUsedYet", "notUsedYet",
                    pres.isDownloadable(), ConversionMessageConstants.PAGE_COUNT_EXCEEDED_KEY,
                    e.getPageCount(), e.getMaxNumberOfPages());

            notifier.sendDocConversionProgress(progress);
        }
    }

    public void start() {
        log.info("Ready to process presentation files!");

        try {
            processPresentation = true;

            Runnable messageProcessor = new Runnable() {
                public void run() {
                    while (processPresentation) {
                        try {
                            UploadedPresentation pres = presentations.take();
                            processUploadedPresentation(pres);
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
        processPresentation = false;
    }

    public void setSwfSlidesGenerationProgressNotifier(SwfSlidesGenerationProgressNotifier notifier) {
        this.notifier = notifier;
    }

    public void setCounterService(PageCounterService counterService) {
        this.counterService = counterService;
    }

    public void setPageExtractor(PageExtractor extractor) {
        this.pageExtractor = extractor;
    }

    public void setPageConverter(PageConverter converter) {
        this.pdfToSwfConverter = converter;
    }

    public void setBlankSlide(String blankSlide) {
        this.BLANK_SLIDE = blankSlide;
    }

    public void setMaxSwfFileSize(int size) {
        this.MAX_SWF_FILE_SIZE = size;
    }

    public void setGeneratePngs(boolean generatePngs) {
        this.generatePngs = generatePngs;
    }

    public void setSwfSlidesRequired(boolean swfSlidesRequired) {
        this.swfSlidesRequired = swfSlidesRequired;
    }

    public void setBigPdfSize(long bigPdfSize) {
        this.bigPdfSize = bigPdfSize;
    }

    public void setMaxBigPdfPageSize(long maxBigPdfPageSize) {
        this.maxBigPdfPageSize = maxBigPdfPageSize;
    }

    public void setSvgImagesRequired(boolean svgImagesRequired) {
        this.svgImagesRequired = svgImagesRequired;
    }

    public void setThumbnailCreator(ThumbnailCreator thumbnailCreator) {
        this.thumbnailCreator = thumbnailCreator;
    }

    public void setPngCreator(PngCreator pngCreator) {
        this.pngCreator = pngCreator;
    }

    public void setTextFileCreator(TextFileCreator textFileCreator) {
        this.textFileCreator = textFileCreator;
    }

    public void setSvgImageCreator(SvgImageCreator svgImageCreator) {
        this.svgImageCreator = svgImageCreator;
    }

    public void setMaxConversionTime(int minutes) {
        MAX_CONVERSION_TIME = minutes * 60 * 1000L * 1000L * 1000L;
    }

    public void setImageToSwfSlidesGenerationService(ImageToSwfSlidesGenerationService s) {
        imageToSwfSlidesGenerationService = s;
    }

    public void setPresentationConversionCompletionService(PresentationConversionCompletionService s) {
        this.presentationConversionCompletionService = s;
    }

    public void setPdfToSwfSlidesGenerationService(PdfToSwfSlidesGenerationService s) {
        this.pdfToSwfSlidesGenerationService = s;
    }
}
