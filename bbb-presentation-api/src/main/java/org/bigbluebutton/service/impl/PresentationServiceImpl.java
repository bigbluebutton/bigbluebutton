package org.bigbluebutton.service.impl;

import org.apache.commons.io.FilenameUtils;
import org.bigbluebutton.service.DocumentConversionService;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.bigbluebutton.presentation.messages.PresentationUploadToken;
import org.bigbluebutton.service.PresentationService;
import org.bigbluebutton.util.Pair;
import org.bigbluebutton.util.Util;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;

@Service
public class PresentationServiceImpl implements PresentationService {

    private static final Logger logger = LoggerFactory.getLogger(PresentationServiceImpl.class);

    private Map<String, PresentationUploadToken> tokens;
    private final SwfSlidesGenerationProgressNotifier notifier;
    private final DocumentConversionService documentConversionService;

    @Value("${bbb.presentation.presentationDir}")
    private String presentationDir;

    @Value("${bbb.presentation.presentationBaseUrl}")
    private String presentationBaseUrl;

    @Autowired
    public PresentationServiceImpl(SwfSlidesGenerationProgressNotifier notifier, DocumentConversionService documentConversionService) {
        this.notifier = notifier;
        this.documentConversionService = documentConversionService;
    }

    @Override
    public boolean isPresentationTokenValid(String token) {
        return tokens.containsKey(token);
    }

    @Override
    public boolean isPresentationTokenValidAndExpired(String token) {
        boolean valid = tokens.containsKey(token);
        expirePresentationToken(token);
        return valid;
    }

    @Override
    public PresentationUploadToken getPresentationUploadToken(String token) {
        if(isPresentationTokenValid(token)) return tokens.get(token);
        return null;
    }

    @Override
    public void sendPresentationUploadMaxFileSizeMessage(PresentationUploadToken uploadToken, int uploadedFileSize, int maxUploadFileSize) {
        notifier.sendUploadFileTooLargeMessage(uploadToken, uploadedFileSize, maxUploadFileSize);
    }

    @Override
    public Pair<String, File> movePresentationFile(MultipartFile file, String presentationFileName, String meetingId, String fileNameExtension) {
        String presId = Util.generatePresentationId(presentationFileName);
        File uploadDir = Util.createPresentationDir(meetingId, presentationDir, presId);
        File pres = null;
        if (uploadDir != null) {
            String newFilename = Util.createNewFilename(presId, fileNameExtension);
            pres = new File(uploadDir.getAbsolutePath() + File.separatorChar + newFilename);
            try {
                file.transferTo(pres);
            } catch(IOException ignored) {}
        }

        return new Pair<>(presId, pres);
    }

    @Override
    public UploadedPresentation generateUploadedPresentation(String podId, String meetingId, String presId, String tempPresId,
                                                             String presFileName, boolean current, String presentationToken,
                                                             boolean uploadFailed, List<String> uploadFailedReasons, boolean isDownloadable) {
        UploadedPresentation uploadedPresentation = new UploadedPresentation(
                podId,
                meetingId,
                presId,
                tempPresId,
                presFileName,
                presentationBaseUrl,
                current,
                presentationToken,
                uploadFailed,
                uploadFailedReasons
        );

        if(isDownloadable) {
            logger.debug("@Setting file to be downloadable...");
            uploadedPresentation.setDownloadable();
        }

        return uploadedPresentation;
    }

    @Override
    public void processUploadedPresentation(UploadedPresentation uploadedPresentation) {
        Timer timer = new Timer(uploadedPresentation.getName(), false);
        timer.schedule(
                new TimerTask() {
                    @Override
                    public void run() {
                        try {
                            documentConversionService.processDocument(uploadedPresentation);
                        } finally {
                            timer.cancel();
                        }
                    }
                }, 5000
        );
    }

    @Override
    public File showSlide(String conference, String room, String presentationName, String slide) {
        String slideFile = "slide-" + slide + ".swf";
        return new File(roomDirectory(conference, room).getAbsolutePath()
                + File.separatorChar + presentationName + File.separatorChar + slideFile);
    }

    @Override
    public File showSvgImage(String conference, String room, String presentationName, String slide) {
        String svgFile = "slide" + slide + ".svg";
        return new File(roomDirectory(conference, room).getAbsolutePath()
                + File.separatorChar + presentationName + File.separatorChar + svgFile);
    }

    @Override
    public File showThumbnail(String conference, String room, String presentationName, String thumbnail) {
        String thumbnailFile = "thumb-" + thumbnail + ".png";
        return new File(roomDirectory(conference, room).getAbsolutePath() + File.separatorChar + presentationName + File.separatorChar +
                "thumbnails" + File.separatorChar + thumbnailFile);
    }

    @Override
    public File showPng(String conference, String room, String presentationName, String png) {
        String pngFile = "slide-" + png + ".png";
        return new File(roomDirectory(conference, room).getAbsolutePath() + File.separatorChar + presentationName + File.separatorChar +
                "pngs" + File.separatorChar + pngFile);
    }

    @Override
    public File showTextFile(String conference, String room, String presentationName, String file) {
        String textFile = "slide-" + file + ".txt";
        return new File(roomDirectory(conference, room).getAbsolutePath() + File.separatorChar + presentationName + File.separatorChar +
                "textfiles" + File.separatorChar + textFile);
    }

    @Override
    public File getDownloadablePresentationFile(String meetingId, String presId, String presentationFilename) {
        logger.info("Find downloadable presentation for meetingId={} presId={} filename={}", meetingId, presId,
                presentationFilename);

        if (! Util.isPresFileIdValidFormat(presentationFilename)) {
            logger.error("Invalid presentation filename for meetingId={} presId={} filename={}", meetingId, presId,
                    presentationFilename);
            return null;
        }

        String presFilenameExt = FilenameUtils.getExtension(presentationFilename);
        File presDir = Util.getPresentationDir(presentationDir, meetingId, presId);
        File downloadMarker = Util.getPresFileDownloadMarker(presDir, presId);
        if (presDir != null && downloadMarker.exists()) {
            String safePresFilename = presId.concat(".").concat(presFilenameExt);
            File presFile = new File(presDir.getAbsolutePath() + File.separatorChar + safePresFilename);
            if (presFile.exists()) {
                return presFile;
            }

            logger.error("Presentation file missing for meetingId={} presId={} filename={}", meetingId, presId,
                    presentationFilename);
            return null;
        }

        logger.error("Invalid presentation directory for meetingId={} presId={} filename={}", meetingId, presId,
                presentationFilename);
        return null;
    }

    @Override
    public int numberOfThumbnails(String conference, String room, String presentationName) {
        File thumbDir = new File(roomDirectory(conference, room).getAbsolutePath() + File.separatorChar +
                presentationName + File.separatorChar + "thumbnails");
        return thumbDir.listFiles().length;
    }


    private void expirePresentationToken(String token) {
        tokens.remove(token);
    }

    private void processPresentationUploadToken(PresentationUploadToken message) {
        tokens.put(message.authzToken, message);
    }

    private File roomDirectory(String conference, String room) {
        return new File(presentationDir + File.separatorChar + conference + File.separatorChar + room);
    }
}
