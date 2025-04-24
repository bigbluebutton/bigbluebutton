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
    private int thumbScale = 150; //used when converting pdf to thumb
    private int maxImageWidth = 2048;
    private int maxImageHeight = 1536;
    private int placementsThreshold = 800;
    private int imageTagThreshold = 800;
    private int pngScaleTo = 800;
    private int pngDefaultWidth = 500;
    private int pngDefaultHeight = 500;
    private int pdfFontsTimeout = 3;
    private int maxNumberOfAttemptsForPdfFonts = 3;
    private int svgPresentationResolutionPpi = 300;
    private boolean forceRasterizeSlides = false;
    private String pngWidthRasterizedSlides = "2048";
    private String pageConversionMemoryHigh = "512M";
    private String pageConversionMemoryMax = "640M";


    public boolean processPage(String meetingId, String presentationId, int page) {
        List<String> command = Arrays.asList(
                "systemd-run", "--user", "--pipe", "--wait", "--same-dir",
                "-p", "Environment=PRESENTATIONS_DIR=" + presentationDir,
                "-p", "Environment=THUMBNAIL_SCALE=" + thumbScale,
                "-p", "Environment=PDF_FONTS_TIMEOUT=" + pdfFontsTimeout,
                "-p", "Environment=PDF_FONTS_MAX_ATTEMPTS=" + maxNumberOfAttemptsForPdfFonts,
                "-p", "Environment=SVG_RESOLUTION_PPI=" + svgPresentationResolutionPpi,
                "-p", "Environment=MAX_SVG_PATHS=" + placementsThreshold,
                "-p", "Environment=MAX_SVG_IMGS=" + imageTagThreshold,
                "-p", "Environment=MAX_IMAGE_WIDTH=" + maxImageWidth,
                "-p", "Environment=MAX_IMAGE_HEIGHT=" + maxImageHeight,
                "-p", "Environment=PNG_DEFAULT_WIDTH=" + pngDefaultWidth,
                "-p", "Environment=PNG_DEFAULT_HEIGHT=" + pngDefaultHeight,
                "-p", "Environment=PNG_SCALE_TO=" + pngScaleTo,
                "-p", "Environment=GENERATE_PNGS=" + booleanToString(generatePngs),
                "-p", "Environment=RASTERIZE_SLIDE_FORCE=" + booleanToString(forceRasterizeSlides),
                "-p", "Environment=RASTERIZE_PNG_WIDTH=" + pngWidthRasterizedSlides,
                "-p", "ProtectSystem=strict",
                "-p", "ProtectHome=yes",
                "-p", "PrivateTmp=true",
                "-p", "PrivateUsers=true",
                "-p", "NoNewPrivileges=true",
                "-p", "RestrictRealtime=true",
                "-p", "SystemCallFilter=~@mount",
                "-p", "Type=oneshot",
                "-p", "TimeoutSec=" + (maxConversionTime * 60),
                "-p", "MemoryHigh=" + pageConversionMemoryHigh,
                "-p", "MemoryMax=" + pageConversionMemoryMax,
                "-p", "MemorySwapMax=0",
                "/usr/local/bin/bbb-process-pdf-page.sh",
                meetingId + "_" + presentationId +"_" + page
        );


        log.debug("Starting processing page [{}]", String.join(" ", command));
        return new ExternalProcessExecutor().exec(command, Duration.ofMillis(maxConversionTime * 60 * 1000));
    }

    public boolean processImage(String meetingId, String presentationId, String fileType) {
        List<String> command = Arrays.asList(
                "systemd-run", "--user", "--pipe", "--wait", "--same-dir",
                "-p", "Environment=PRESENTATIONS_DIR=" + presentationDir,
                "-p", "Environment=SVG_RESOLUTION_PPI=" + svgPresentationResolutionPpi,
                "-p", "Environment=MAX_SVG_PATHS=" + placementsThreshold,
                "-p", "Environment=MAX_SVG_IMGS=" + imageTagThreshold,
                "-p", "Environment=MAX_IMAGE_WIDTH=" + maxImageWidth,
                "-p", "Environment=MAX_IMAGE_HEIGHT=" + maxImageHeight,
                "-p", "Environment=PNG_DEFAULT_WIDTH=" + pngDefaultWidth,
                "-p", "Environment=PNG_DEFAULT_HEIGHT=" + pngDefaultHeight,
                "-p", "Environment=PNG_SCALE_TO=" + pngScaleTo,
                "-p", "Environment=THUMBNAIL_SCALE=" + thumbScale,
                "-p", "Environment=GENERATE_PNGS=" + booleanToString(generatePngs),
                "-p", "Environment=RASTERIZE_PNG_WIDTH=" + pngWidthRasterizedSlides,
                "-p", "ProtectSystem=strict",
                "-p", "ProtectHome=yes",
                "-p", "PrivateTmp=true",
                "-p", "PrivateUsers=true",
                "-p", "NoNewPrivileges=true",
                "-p", "RestrictRealtime=true",
                "-p", "SystemCallFilter=~@mount",
                "-p", "Type=oneshot",
                "-p", "TimeoutSec=" + (maxConversionTime * 60),
                "-p", "MemoryHigh=" + pageConversionMemoryHigh,
                "-p", "MemoryMax=" + pageConversionMemoryMax,
                "-p", "MemorySwapMax=0",
                "/usr/local/bin/bbb-process-image.sh",
                meetingId + "_" + presentationId +"_1_" + fileType
        );

        log.debug("Starting processing image [{}]", String.join(" ", command));
        return new ExternalProcessExecutor().exec(command, Duration.ofMillis(maxConversionTime * 60 * 1000));
    }

    public String booleanToString(boolean value) {
        if(value) {
            return "true";
        } else {
            return "false";
        }
    }

    public void setMaxConversionTime(long maxConversionTime) {
        this.maxConversionTime = maxConversionTime;
    }

    public void setPresentationDir(String presentationDir) {
        this.presentationDir = presentationDir;
    }

    public void setGeneratePngs(boolean generatePngs) {
        this.generatePngs = generatePngs;
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

    public void setPdfFontsTimeout(int pdfFontsTimeout) {
        this.pdfFontsTimeout = pdfFontsTimeout;
    }

    public void setMaxNumberOfAttemptsForPdfFonts(int maxNumberOfAttemptsForPdfFonts) {
        this.maxNumberOfAttemptsForPdfFonts = maxNumberOfAttemptsForPdfFonts;
    }

    public void setSvgPresentationResolutionPpi(int svgPresentationResolutionPpi) {
        this.svgPresentationResolutionPpi = svgPresentationResolutionPpi;
    }

    public void setForceRasterizeSlides(boolean forceRasterizeSlides) {
        this.forceRasterizeSlides = forceRasterizeSlides;
    }

    public void setPngWidthRasterizedSlides(String pngWidthRasterizedSlides) {
        this.pngWidthRasterizedSlides = pngWidthRasterizedSlides;
    }

    public void setPageConversionMemoryHigh(String pageConversionMemoryHigh) {
        this.pageConversionMemoryHigh = pageConversionMemoryHigh;
    }

    public void setPageConversionMemoryMax(String pageConversionMemoryMax) {
        this.pageConversionMemoryMax = pageConversionMemoryMax;
    }
}
