package org.bigbluebutton.presentation.imp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;

public class PresentationProcessExternal {
    private static Logger log = LoggerFactory.getLogger(PresentationProcessExternal.class);
    private String presentationDir = "/var/bigbluebutton";
    private long maxConversionTime = 5*60;
    private boolean generatePngs = false;
    private String generatePngsString = "false";
    private int thumbScale = 150; //used when converting pdf to thumb
    private String thumbnailDimension = "150x150"; //used when converting image to thumb
    private int maxImageWidth = 2048;
    private int maxImageHeight = 1536;
    private int placementsThreshold = 800;
    private int imageTagThreshold = 800;
    private int pngScaleTo = 800;
    private int pngDefaultWidth = 500;
    private int pngDefaultHeight = 500;
    private int pdfFontsTimeout = 3;
    private int maxNumberOfAttemptsForPdfFonts = 3;
    private int svgConversionTimeout = 60;
    private int svgPresentationResolutionPpi = 300;
    private int pngCreationConversionTimeout = 7;

    public boolean processPage(String meetingId, String presentationId, int page) {
        List<String> command = Arrays.asList(
                "systemd-run", "--user", "--pipe", "--wait", "--same-dir",
                "-p", "Environment=PRESENTATIONS_DIR=" + presentationDir,
                "-p", "Environment=THUMBNAIL_SCALE=" + thumbScale,
                "-p", "Environment=PDF_FONTS_TIMEOUT=" + pdfFontsTimeout,
                "-p", "Environment=PDF_FONTS_MAX_ATTEMPTS=" + maxNumberOfAttemptsForPdfFonts,
                "-p", "Environment=SVG_CONV_TIMEOUT=" + svgConversionTimeout,
                "-p", "Environment=SVG_RESOLUTION_PPI=" + svgPresentationResolutionPpi,
                "-p", "Environment=MAX_SVG_PATHS=" + placementsThreshold,
                "-p", "Environment=MAX_SVG_IMGS=" + imageTagThreshold,
                "-p", "Environment=PNG_X_SCALE=" + maxImageWidth,
                "-p", "Environment=PNG_Y_SCALE=" + maxImageHeight,
                "-p", "Environment=PNG_DEFAULT_WIDTH=" + pngDefaultWidth,
                "-p", "Environment=PNG_DEFAULT_HEIGHT=" + pngDefaultHeight,
                "-p", "Environment=PNG_SCALE_TO=" + pngScaleTo,
//                "-p", "Environment=IMG_THUMB_DIM=" + thumbnailDimension,
//                "-p", "Environment=IMG_CONV_TIMEOUT=" + pngCreationConversionTimeout,
                "-p", "Environment=GENERATE_PNGS=" + generatePngsString,
                "-p", "ProtectSystem=strict",
                "-p", "ProtectHome=yes",
                "-p", "PrivateTmp=true",
                "-p", "PrivateUsers=true",
                "-p", "NoNewPrivileges=true",
                "-p", "RestrictRealtime=true",
                "-p", "SystemCallFilter=~@mount",
                "-p", "Type=oneshot",
                "-p", "TimeoutSec=" + (maxConversionTime * 60),
                "-p", "MemoryHigh=512M",
                "-p", "MemoryMax=640M",
                "-p", "MemorySwapMax=0",
                "/usr/local/bin/bbb-process-pdf-page.sh",
                meetingId + "_" + presentationId +"_" + page
        );


        log.debug("Starting processing [{}]", String.join(" ", command));
        return new ExternalProcessExecutor().exec(command, Duration.ofMillis(maxConversionTime * 60 * 1000));
    }

    public boolean processImage(String meetingId, String presentationId, String fileType) {
        List<String> command = Arrays.asList(
                "systemd-run", "--user", "--pipe", "--wait", "--same-dir",
                "-p", "Environment=PRESENTATIONS_DIR=" + presentationDir,
//                "-p", "Environment=THUMBNAIL_SCALE=" + thumbScale,
//                "-p", "Environment=PDF_FONTS_TIMEOUT=" + pdfFontsTimeout,
//                "-p", "Environment=PDF_FONTS_MAX_ATTEMPTS=" + maxNumberOfAttemptsForPdfFonts,
                "-p", "Environment=SVG_CONV_TIMEOUT=" + svgConversionTimeout,
                "-p", "Environment=SVG_RESOLUTION_PPI=" + svgPresentationResolutionPpi,
                "-p", "Environment=MAX_SVG_PATHS=" + placementsThreshold,
                "-p", "Environment=MAX_SVG_IMGS=" + imageTagThreshold,
                "-p", "Environment=PNG_X_SCALE=" + maxImageWidth,
                "-p", "Environment=PNG_Y_SCALE=" + maxImageHeight,
                "-p", "Environment=PNG_DEFAULT_WIDTH=" + pngDefaultWidth,
                "-p", "Environment=PNG_DEFAULT_HEIGHT=" + pngDefaultHeight,
                "-p", "Environment=PNG_SCALE_TO=" + pngScaleTo,
                "-p", "Environment=IMG_THUMB_DIM=" + thumbnailDimension,
                "-p", "Environment=IMG_CONV_TIMEOUT=" + pngCreationConversionTimeout,
                "-p", "Environment=GENERATE_PNGS=" + generatePngsString,
                "-p", "ProtectSystem=strict",
                "-p", "ProtectHome=yes",
                "-p", "PrivateTmp=true",
                "-p", "PrivateUsers=true",
                "-p", "NoNewPrivileges=true",
                "-p", "RestrictRealtime=true",
                "-p", "SystemCallFilter=~@mount",
                "-p", "Type=oneshot",
                "-p", "TimeoutSec=" + (maxConversionTime * 60),
                "-p", "MemoryHigh=512M",
                "-p", "MemoryMax=640M",
                "-p", "MemorySwapMax=0",
                "/usr/local/bin/bbb-process-image.sh",
                meetingId + "_" + presentationId +"_" + fileType
        );

        log.debug("Starting processing [{}]", String.join(" ", command));
        return new ExternalProcessExecutor().exec(command, Duration.ofMillis(maxConversionTime * 60 * 1000));
    }

    public void setMaxConversionTime(long maxConversionTime) {
        this.maxConversionTime = maxConversionTime;
    }

    public void setPresentationDir(String presentationDir) {
        this.presentationDir = presentationDir;
    }

    public void setGeneratePngs(boolean generatePngs)
    {
        this.generatePngs = generatePngs;

        if(this.generatePngs) {
            this.generatePngsString = "true";
        } else {
            this.generatePngsString = "false";
        }
    }

    public void setThumbScale(int thumbScale) {
        this.thumbScale = thumbScale;
    }

    public void setMaxImageWidth(int maxImageWidth) {
        this.maxImageWidth = maxImageWidth;
    }

    public void setMaxImageHeight(int maxImageHeight) {
        this.maxImageHeight = maxImageHeight;
    }

    public void setPlacementsThreshold(int placementsThreshold) {
        this.placementsThreshold = placementsThreshold;
    }

    public void setImageTagThreshold(int imageTagThreshold) {
        this.imageTagThreshold = imageTagThreshold;
    }

    public void setPngScaleTo(int pngScaleTo) {
        this.pngScaleTo = pngScaleTo;
    }

    public void setPngDefaultWidth(int pngDefaultWidth) {
        this.pngDefaultWidth = pngDefaultWidth;
    }

    public void setPngDefaultHeight(int pngDefaultHeight) {
        this.pngDefaultHeight = pngDefaultHeight;
    }

    public void setThumbnailDimension(String thumbnailDimension) {
        this.thumbnailDimension = thumbnailDimension;
    }

    public void setPdfFontsTimeout(int pdfFontsTimeout) {
        this.pdfFontsTimeout = pdfFontsTimeout;
    }

    public void setMaxNumberOfAttemptsForPdfFonts(int maxNumberOfAttemptsForPdfFonts) {
        this.maxNumberOfAttemptsForPdfFonts = maxNumberOfAttemptsForPdfFonts;
    }

    public void setSvgConversionTimeout(int svgConversionTimeout) {
        this.svgConversionTimeout = svgConversionTimeout;
    }

    public void setSvgPresentationResolutionPpi(int svgPresentationResolutionPpi) {
        this.svgPresentationResolutionPpi = svgPresentationResolutionPpi;
    }

    public void setPngCreationConversionTimeout(int pngCreationConversionTimeout) {
        this.pngCreationConversionTimeout = pngCreationConversionTimeout;
    }
}
