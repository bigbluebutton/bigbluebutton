package org.bigbluebutton.presentation;

import java.io.File;
import java.io.FilenameFilter;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.io.FilenameUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PresentationUrlDownloadService {
    private static Logger log = LoggerFactory
            .getLogger(PresentationUrlDownloadService.class);

    private PageExtractor pageExtractor;
    private DocumentConversionService documentConversionService;
    private String presentationBaseURL;
    private String presentationDir;

    public void processUploadedPresentation(UploadedPresentation uploadedPres) {
        documentConversionService.processDocument(uploadedPres);
    }

    public void processUploadedFile(String meetingId, String presId,
            String filename, File presFile) {
        UploadedPresentation uploadedPres = new UploadedPresentation(meetingId,
                presId, filename, presentationBaseURL);
        uploadedPres.setUploadedFile(presFile);
        processUploadedPresentation(uploadedPres);
    }

    public void extractPage(String sourceMeetingId, String presentationId,
            Integer presentationSlide, String destinationMeetingId) {

        // Construct the source meeting path
        File sourceMeetingPath = new File(presentationDir + File.separator
                + sourceMeetingId + File.separator + sourceMeetingId
                + File.separator + presentationId);

        final String presentationFilter = presentationId;
        FilenameFilter filter = new FilenameFilter() {
            public boolean accept(File dir, String name) {
                return name.startsWith(presentationFilter);
            }
        };

        File[] children = sourceMeetingPath.listFiles(filter);

        if (children.length != 1) {
            log.error("Not matching file with prefix {} found at {}",
                    sourceMeetingId, sourceMeetingPath);
            return;
        } else {
            File sourcePresentationFile = children[0];
            String filenameExt = FilenameUtils
                    .getExtension(sourcePresentationFile.getName());
            String presId = generatePresentationId(presentationId);
            String newFilename = createNewFilename(presId, filenameExt);

            File uploadDir = createPresentationDirectory(destinationMeetingId,
                    presentationDir, presId);
            String newFilePath = uploadDir.getAbsolutePath()
                    + File.separatorChar + newFilename;

            pageExtractor.extractPage(sourcePresentationFile, new File(
                    newFilePath), presentationSlide);

            File pres = new File(newFilePath);
            processUploadedFile(destinationMeetingId, presId, "default-"
                    + presentationSlide.toString() + "." + filenameExt, pres);
        }
    }

    public String generatePresentationId(String name) {
        long timestamp = System.currentTimeMillis();
        return DigestUtils.shaHex(name) + "-" + timestamp;
    }

    public String createNewFilename(String presId, String fileExt) {
        return presId + "." + fileExt;
    }

    public File createPresentationDirectory(String meetingId,
            String presentationDir, String presentationId) {
        String meetingPath = presentationDir + File.separatorChar + meetingId
                + File.separatorChar + meetingId;
        String presPath = meetingPath + File.separatorChar + presentationId;
        File dir = new File(presPath);
        log.debug("Creating dir [{}]", presPath);
        if (dir.mkdirs()) {
            return dir;
        }
        return null;
    }

    public void setPageExtractor(PageExtractor extractor) {
        this.pageExtractor = extractor;
    }

    public void setPresentationDir(String presDir) {
        presentationDir = presDir;
    }

    public void setPresentationBaseURL(String presentationBaseUrl) {
        presentationBaseURL = presentationBaseUrl;
    }

    public void setDocumentConversionService(
            DocumentConversionService documentConversionService) {
        this.documentConversionService = documentConversionService;
    }

}
